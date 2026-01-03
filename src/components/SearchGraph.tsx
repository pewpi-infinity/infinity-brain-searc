import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, ArrowsOut, ArrowsIn } from '@phosphor-icons/react'
import { SearchResult } from './SearchResults'

interface Node extends d3.SimulationNodeDatum {
  id: string
  title: string
  url: string
  source: string
  type: 'query' | 'result' | 'domain' | 'keyword' | 'topic'
  group: number
  weight?: number
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node
  target: string | Node
  value: number
}

interface SearchGraphProps {
  results: SearchResult[]
  query: string
  onClose: () => void
}

export function SearchGraph({ results, query, onClose }: SearchGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [graphStats, setGraphStats] = useState({ nodeCount: 0, linkCount: 0 })

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect()
        setDimensions({ width, height })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  useEffect(() => {
    if (!svgRef.current || results.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const { width, height } = dimensions

    const domains = new Map<string, { id: string; name: string; count: number }>()
    results.forEach(result => {
      try {
        const url = new URL(result.url)
        const domain = url.hostname
        if (!domains.has(domain)) {
          domains.set(domain, { id: domain, name: domain, count: 0 })
        }
        const domainData = domains.get(domain)!
        domainData.count++
      } catch {
        if (!domains.has(result.source)) {
          domains.set(result.source, { id: result.source, name: result.source, count: 0 })
        }
        const domainData = domains.get(result.source)!
        domainData.count++
      }
    })

    const extractKeywords = (text: string): string[] => {
      const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those'])
      return text
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 3 && !commonWords.has(word))
        .slice(0, 3)
    }

    const keywords = new Map<string, { count: number; relatedResults: string[] }>()
    results.forEach(result => {
      const resultKeywords = extractKeywords(`${result.title} ${result.snippet}`)
      resultKeywords.forEach(keyword => {
        if (!keywords.has(keyword)) {
          keywords.set(keyword, { count: 0, relatedResults: [] })
        }
        const keywordData = keywords.get(keyword)!
        keywordData.count++
        keywordData.relatedResults.push(result.id)
      })
    })

    const topKeywords = Array.from(keywords.entries())
      .filter(([_, data]) => data.count >= 2)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 8)

    const topics = new Map<string, string[]>()
    const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2)
    queryWords.forEach(word => {
      const relatedResults = results
        .filter(r => 
          r.title.toLowerCase().includes(word) || 
          r.snippet.toLowerCase().includes(word)
        )
        .map(r => r.id)
      if (relatedResults.length >= 2) {
        topics.set(word, relatedResults)
      }
    })

    const nodes: Node[] = [
      {
        id: 'query',
        title: query,
        url: '',
        source: '',
        type: 'query',
        group: 0,
        weight: 3,
      },
      ...results.map((result, index) => ({
        id: result.id,
        title: result.title,
        url: result.url,
        source: result.source,
        type: 'result' as const,
        group: index % 5 + 1,
        weight: 1,
      })),
      ...Array.from(domains.values()).map(domain => ({
        id: `domain-${domain.id}`,
        title: domain.name,
        url: '',
        source: domain.name,
        type: 'domain' as const,
        group: 6,
        weight: 1.5,
      })),
      ...topKeywords.map(([keyword, data], index) => ({
        id: `keyword-${keyword}`,
        title: keyword,
        url: '',
        source: `${data.count} results`,
        type: 'keyword' as const,
        group: 7 + (index % 3),
        weight: data.count / 2,
      })),
      ...Array.from(topics.entries()).map(([topic, _], index) => ({
        id: `topic-${topic}`,
        title: topic,
        url: '',
        source: 'topic',
        type: 'topic' as const,
        group: 10 + index,
        weight: 2,
      })),
    ]

    const links: Link[] = [
      ...results.map(result => ({
        source: 'query',
        target: result.id,
        value: 3,
      })),
      ...results.map(result => {
        try {
          const url = new URL(result.url)
          return {
            source: result.id,
            target: `domain-${url.hostname}`,
            value: 1,
          }
        } catch {
          return {
            source: result.id,
            target: `domain-${result.source}`,
            value: 1,
          }
        }
      }),
      ...topKeywords.flatMap(([keyword, data]) =>
        data.relatedResults.map(resultId => ({
          source: `keyword-${keyword}`,
          target: resultId,
          value: 1,
        }))
      ),
      ...Array.from(topics.entries()).flatMap(([topic, relatedResults]) =>
        relatedResults.map(resultId => ({
          source: 'query',
          target: `topic-${topic}`,
          value: 2,
        })).concat(
          relatedResults.map(resultId => ({
            source: `topic-${topic}`,
            target: resultId,
            value: 1.5,
          }))
        )
      ),
    ]

    results.forEach((result1, i) => {
      results.slice(i + 1).forEach(result2 => {
        const words1 = extractKeywords(`${result1.title} ${result1.snippet}`)
        const words2 = extractKeywords(`${result2.title} ${result2.snippet}`)
        const commonWords = words1.filter(w => words2.includes(w))
        if (commonWords.length >= 2) {
          links.push({
            source: result1.id,
            target: result2.id,
            value: 0.5,
          })
        }
      })
    })

    const simulation = d3
      .forceSimulation<Node>(nodes)
      .force(
        'link',
        d3
          .forceLink<Node, Link>(links)
          .id(d => d.id)
          .distance(d => {
            if (d.value === 3) return 150
            if (d.value === 2) return 120
            if (d.value === 1.5) return 100
            if (d.value === 1) return 80
            return 60
          })
          .strength(d => d.value / 3)
      )
      .force('charge', d3.forceManyBody().strength(d => {
        if (d.type === 'query') return -800
        if (d.type === 'topic') return -400
        if (d.type === 'keyword') return -300
        return -200
      }))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => {
        if (d.type === 'query') return 50
        if (d.type === 'topic') return 35
        if (d.type === 'keyword') return 30
        if (d.type === 'domain') return 30
        return 25
      }))

    const g = svg.append('g')

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
      })

    svg.call(zoom)

    const defs = svg.append('defs')
    const queryGradient = defs
      .append('radialGradient')
      .attr('id', 'query-gradient')
      .attr('cx', '30%')
      .attr('cy', '30%')

    queryGradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', 'oklch(0.70 0.18 200)')
      .attr('stop-opacity', 1)

    queryGradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', 'oklch(0.45 0.15 300)')
      .attr('stop-opacity', 1)

    const topicGradient = defs
      .append('radialGradient')
      .attr('id', 'topic-gradient')
      .attr('cx', '30%')
      .attr('cy', '30%')

    topicGradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', 'oklch(0.75 0.15 180)')
      .attr('stop-opacity', 1)

    topicGradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', 'oklch(0.60 0.18 210)')
      .attr('stop-opacity', 1)

    const keywordGradient = defs
      .append('radialGradient')
      .attr('id', 'keyword-gradient')
      .attr('cx', '30%')
      .attr('cy', '30%')

    keywordGradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', 'oklch(0.80 0.12 160)')
      .attr('stop-opacity', 1)

    keywordGradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', 'oklch(0.65 0.16 190)')
      .attr('stop-opacity', 1)

    const link = g
      .append('g')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', d => {
        if (d.value >= 2.5) return 'oklch(0.45 0.15 300 / 0.5)'
        if (d.value >= 1.5) return 'oklch(0.55 0.20 250 / 0.4)'
        if (d.value >= 1) return 'oklch(0.70 0.18 200 / 0.3)'
        return 'oklch(0.70 0.18 200 / 0.15)'
      })
      .attr('stroke-width', d => Math.sqrt(d.value) * 1.5)
      .attr('stroke-linecap', 'round')
      .attr('stroke-dasharray', d => d.value < 1 ? '3,3' : 'none')

    const node = g
      .append('g')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .call(
        d3
          .drag<SVGGElement, Node>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart()
            d.fx = d.x
            d.fy = d.y
          })
          .on('drag', (event, d) => {
            d.fx = event.x
            d.fy = event.y
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0)
            d.fx = null
            d.fy = null
          })
      )

    node
      .append('circle')
      .attr('r', d => {
        if (d.type === 'query') return 35
        if (d.type === 'topic') return 28
        if (d.type === 'keyword') return 22
        if (d.type === 'domain') return 25
        return 20
      })
      .attr('fill', d => {
        if (d.type === 'query') return 'url(#query-gradient)'
        if (d.type === 'topic') return 'url(#topic-gradient)'
        if (d.type === 'keyword') return 'url(#keyword-gradient)'
        if (d.type === 'domain') return 'oklch(0.55 0.20 250)'
        return 'oklch(0.70 0.18 200)'
      })
      .attr('stroke', d => {
        if (d.type === 'keyword') return 'oklch(0.80 0.12 160)'
        if (d.type === 'topic') return 'oklch(0.75 0.15 180)'
        return 'oklch(0.98 0 0)'
      })
      .attr('stroke-width', d => d.type === 'query' ? 4 : 3)
      .style('cursor', 'pointer')
      .style('filter', d => d.type === 'query' ? 'drop-shadow(0 0 8px oklch(0.70 0.18 200 / 0.6))' : 'none')
      .on('mouseenter', function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', () => {
            if (d.type === 'query') return 40
            if (d.type === 'topic') return 33
            if (d.type === 'keyword') return 27
            if (d.type === 'domain') return 30
            return 25
          })
          .attr('stroke-width', d.type === 'query' ? 5 : 4)
          .style('filter', 'drop-shadow(0 0 12px oklch(0.70 0.18 200 / 0.8))')

        link
          .transition()
          .duration(200)
          .attr('stroke-opacity', l => {
            const source = typeof l.source === 'string' ? l.source : l.source.id
            const target = typeof l.target === 'string' ? l.target : l.target.id
            return source === d.id || target === d.id ? 0.9 : 0.1
          })
          .attr('stroke-width', l => {
            const source = typeof l.source === 'string' ? l.source : l.source.id
            const target = typeof l.target === 'string' ? l.target : l.target.id
            return source === d.id || target === d.id ? Math.sqrt(l.value) * 2.5 : Math.sqrt(l.value) * 1.5
          })
      })
      .on('mouseleave', function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', () => {
            if (d.type === 'query') return 35
            if (d.type === 'topic') return 28
            if (d.type === 'keyword') return 22
            if (d.type === 'domain') return 25
            return 20
          })
          .attr('stroke-width', d.type === 'query' ? 4 : 3)
          .style('filter', d.type === 'query' ? 'drop-shadow(0 0 8px oklch(0.70 0.18 200 / 0.6))' : 'none')

        link
          .transition()
          .duration(200)
          .attr('stroke-opacity', 0.6)
          .attr('stroke-width', d => Math.sqrt(d.value) * 1.5)
      })
      .on('click', (event, d) => {
        if (d.url) {
          window.open(d.url, '_blank')
        }
      })

    node
      .append('text')
      .attr('dy', d => {
        if (d.type === 'query') return 50
        if (d.type === 'topic') return 43
        if (d.type === 'keyword') return 37
        if (d.type === 'domain') return 40
        return 35
      })
      .attr('text-anchor', 'middle')
      .attr('fill', 'oklch(0.20 0.05 270)')
      .attr('font-size', d => {
        if (d.type === 'query') return '14px'
        if (d.type === 'topic') return '12px'
        if (d.type === 'keyword') return '10px'
        return '11px'
      })
      .attr('font-weight', d => (d.type === 'query' || d.type === 'topic' ? 'bold' : 'normal'))
      .attr('pointer-events', 'none')
      .text(d => {
        const maxLength = d.type === 'query' ? 30 : d.type === 'topic' ? 15 : 20
        return d.title.length > maxLength
          ? d.title.substring(0, maxLength) + '...'
          : d.title
      })

    node
      .filter(d => d.type === 'result' || d.type === 'keyword')
      .append('text')
      .attr('dy', d => (d.type === 'result' ? 48 : 50))
      .attr('text-anchor', 'middle')
      .attr('fill', 'oklch(0.50 0.05 270)')
      .attr('font-size', '9px')
      .attr('pointer-events', 'none')
      .text(d => d.source)

    const tooltip = d3
      .select(containerRef.current)
      .append('div')
      .style('position', 'absolute')
      .style('background', 'oklch(0.20 0.05 270)')
      .style('color', 'oklch(0.98 0 0)')
      .style('padding', '8px 12px')
      .style('border-radius', '8px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('transition', 'opacity 0.2s')
      .style('max-width', '200px')
      .style('z-index', 1000)

    node
      .on('mouseenter.tooltip', (event, d) => {
        tooltip
          .style('opacity', 1)
          .html(
            `<strong>${d.title}</strong>${d.source ? `<br/><small>${d.source}</small>` : ''}`
          )
      })
      .on('mousemove.tooltip', (event) => {
        tooltip
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY - 10 + 'px')
      })
      .on('mouseleave.tooltip', () => {
        tooltip.style('opacity', 0)
      })

    simulation.on('tick', () => {
      link
        .attr('x1', d => (typeof d.source === 'object' ? d.source.x! : 0))
        .attr('y1', d => (typeof d.source === 'object' ? d.source.y! : 0))
        .attr('x2', d => (typeof d.target === 'object' ? d.target.x! : 0))
        .attr('y2', d => (typeof d.target === 'object' ? d.target.y! : 0))

      node.attr('transform', d => `translate(${d.x},${d.y})`)
    })

    setGraphStats({ nodeCount: nodes.length, linkCount: links.length })

    return () => {
      simulation.stop()
      tooltip.remove()
    }
  }, [results, query, dimensions])

  const handleZoomIn = () => {
    if (!svgRef.current) return
    const svg = d3.select(svgRef.current)
    svg.transition().call(d3.zoom<SVGSVGElement, unknown>().scaleBy as any, 1.3)
  }

  const handleZoomOut = () => {
    if (!svgRef.current) return
    const svg = d3.select(svgRef.current)
    svg.transition().call(d3.zoom<SVGSVGElement, unknown>().scaleBy as any, 0.7)
  }

  return (
    <Card className="relative w-full h-[600px] overflow-hidden gradient-border">
      <div className="absolute top-4 left-4 z-10 space-y-2">
        <div className="bg-card/90 backdrop-blur-sm p-3 rounded-lg border border-border">
          <h3 className="font-semibold text-sm mb-1">Knowledge Graph</h3>
          <p className="text-xs text-muted-foreground">
            Drag nodes • Click to visit • Scroll to zoom
          </p>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button
          size="icon"
          variant="secondary"
          onClick={handleZoomIn}
          className="bg-card/90 backdrop-blur-sm"
        >
          <ArrowsIn size={18} weight="bold" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          onClick={handleZoomOut}
          className="bg-card/90 backdrop-blur-sm"
        >
          <ArrowsOut size={18} weight="bold" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          onClick={onClose}
          className="bg-card/90 backdrop-blur-sm hover:bg-destructive hover:text-destructive-foreground"
        >
          <X size={18} weight="bold" />
        </Button>
      </div>

      <div
        ref={containerRef}
        className="w-full h-full relative"
        style={{ background: 'oklch(0.98 0.01 250)' }}
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          style={{ cursor: 'grab' }}
        />
      </div>

      <div className="absolute bottom-4 left-4 z-10 bg-card/90 backdrop-blur-sm p-3 rounded-lg border border-border max-w-md">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[oklch(0.70_0.18_200)] to-[oklch(0.45_0.15_300)]" />
            <span>Query</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[oklch(0.70_0.18_200)]" />
            <span>Results</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[oklch(0.75_0.15_180)] to-[oklch(0.60_0.18_210)]" />
            <span>Topics</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[oklch(0.80_0.12_160)] to-[oklch(0.65_0.16_190)]" />
            <span>Keywords</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[oklch(0.55_0.20_250)]" />
            <span>Domains</span>
          </div>
          <div className="flex items-center gap-2 col-span-1">
            <div className="w-6 h-0.5 bg-[oklch(0.70_0.18_200)] opacity-30" style={{ borderTop: '2px dashed' }} />
            <span className="text-[10px]">Related</span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-border text-[10px] text-muted-foreground">
          {graphStats.nodeCount} nodes • {graphStats.linkCount} connections
        </div>
      </div>
    </Card>
  )
}
