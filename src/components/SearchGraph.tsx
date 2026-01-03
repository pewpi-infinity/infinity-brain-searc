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
  type: 'query' | 'result' | 'domain'
  group: number
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

    const nodes: Node[] = [
      {
        id: 'query',
        title: query,
        url: '',
        source: '',
        type: 'query',
        group: 0,
      },
      ...results.map((result, index) => ({
        id: result.id,
        title: result.title,
        url: result.url,
        source: result.source,
        type: 'result' as const,
        group: index % 5 + 1,
      })),
      ...Array.from(domains.values()).map(domain => ({
        id: `domain-${domain.id}`,
        title: domain.name,
        url: '',
        source: domain.name,
        type: 'domain' as const,
        group: 6,
      })),
    ]

    const links: Link[] = [
      ...results.map(result => ({
        source: 'query',
        target: result.id,
        value: 2,
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
    ]

    const simulation = d3
      .forceSimulation<Node>(nodes)
      .force(
        'link',
        d3
          .forceLink<Node, Link>(links)
          .id(d => d.id)
          .distance(d => (d.value === 2 ? 120 : 80))
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(40))

    const g = svg.append('g')

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
      })

    svg.call(zoom)

    const defs = svg.append('defs')
    const gradient = defs
      .append('radialGradient')
      .attr('id', 'node-gradient')
      .attr('cx', '30%')
      .attr('cy', '30%')

    gradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', 'oklch(0.70 0.18 200)')
      .attr('stop-opacity', 1)

    gradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', 'oklch(0.45 0.15 300)')
      .attr('stop-opacity', 1)

    const link = g
      .append('g')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', 'oklch(0.70 0.18 200 / 0.3)')
      .attr('stroke-width', d => Math.sqrt(d.value) * 2)
      .attr('stroke-linecap', 'round')

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
        if (d.type === 'domain') return 25
        return 20
      })
      .attr('fill', d => {
        if (d.type === 'query') return 'url(#node-gradient)'
        if (d.type === 'domain') return 'oklch(0.55 0.20 250)'
        return 'oklch(0.70 0.18 200)'
      })
      .attr('stroke', 'oklch(0.98 0 0)')
      .attr('stroke-width', 3)
      .style('cursor', 'pointer')
      .on('mouseenter', function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', () => {
            if (d.type === 'query') return 40
            if (d.type === 'domain') return 30
            return 25
          })
          .attr('stroke-width', 4)

        link
          .transition()
          .duration(200)
          .attr('stroke-opacity', l => {
            const source = typeof l.source === 'string' ? l.source : l.source.id
            const target = typeof l.target === 'string' ? l.target : l.target.id
            return source === d.id || target === d.id ? 0.8 : 0.1
          })
      })
      .on('mouseleave', function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', () => {
            if (d.type === 'query') return 35
            if (d.type === 'domain') return 25
            return 20
          })
          .attr('stroke-width', 3)

        link
          .transition()
          .duration(200)
          .attr('stroke-opacity', 0.6)
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
        if (d.type === 'domain') return 40
        return 35
      })
      .attr('text-anchor', 'middle')
      .attr('fill', 'oklch(0.20 0.05 270)')
      .attr('font-size', d => (d.type === 'query' ? '14px' : '11px'))
      .attr('font-weight', d => (d.type === 'query' ? 'bold' : 'normal'))
      .attr('pointer-events', 'none')
      .text(d => {
        const maxLength = d.type === 'query' ? 30 : 20
        return d.title.length > maxLength
          ? d.title.substring(0, maxLength) + '...'
          : d.title
      })

    node
      .filter(d => d.type !== 'domain')
      .append('text')
      .attr('dy', d => (d.type === 'query' ? 65 : 48))
      .attr('text-anchor', 'middle')
      .attr('fill', 'oklch(0.50 0.05 270)')
      .attr('font-size', '9px')
      .attr('pointer-events', 'none')
      .text(d => (d.type === 'result' ? d.source : ''))

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

      <div className="absolute bottom-4 left-4 z-10 bg-card/90 backdrop-blur-sm p-3 rounded-lg border border-border">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[oklch(0.70_0.18_200)] to-[oklch(0.45_0.15_300)]" />
            <span>Query</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[oklch(0.70_0.18_200)]" />
            <span>Results</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[oklch(0.55_0.20_250)]" />
            <span>Domains</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
