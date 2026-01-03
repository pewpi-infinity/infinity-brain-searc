import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { Card } from '@/components/ui/card'
import { MODULE_REGISTRY, MODULE_CATEGORIES } from '@/lib/registry'

export function EcosystemGraph() {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = 1200
    const height = 800

    const modules = Object.values(MODULE_REGISTRY)
    const categories = MODULE_CATEGORIES

    const nodes = modules.map(module => ({
      id: module.id,
      name: module.name,
      category: module.category,
      status: module.status
    }))

    const links = modules.flatMap(module =>
      module.dependencies.map(depId => ({
        source: depId,
        target: module.id
      }))
    )

    const categoryColors: Record<string, string> = {
      infrastructure: 'oklch(0.45 0.15 300)',
      automation: 'oklch(0.55 0.20 250)',
      mechanical: 'oklch(0.60 0.15 220)',
      communication: 'oklch(0.70 0.18 200)',
      intelligence: 'oklch(0.65 0.20 180)',
      navigation: 'oklch(0.70 0.15 160)',
      society: 'oklch(0.55 0.18 140)',
      planning: 'oklch(0.60 0.16 120)',
      economy: 'oklch(0.75 0.20 80)',
      governance: 'oklch(0.50 0.18 40)',
      design: 'oklch(0.65 0.15 320)',
      media: 'oklch(0.70 0.18 280)',
      entertainment: 'oklch(0.60 0.20 260)',
      security: 'oklch(0.45 0.18 20)',
      integration: 'oklch(0.55 0.16 200)',
      sustainability: 'oklch(0.60 0.18 140)'
    }

    const simulation = d3
      .forceSimulation(nodes as any)
      .force(
        'link',
        d3
          .forceLink(links)
          .id((d: any) => d.id)
          .distance(100)
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30))

    const g = svg.append('g')

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
      })

    svg.call(zoom)

    const link = g
      .append('g')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', 'oklch(0.70 0.18 200 / 0.2)')
      .attr('stroke-width', 1)

    const node = g
      .append('g')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .call(
        d3
          .drag<SVGGElement, any>()
          .on('start', (event, d: any) => {
            if (!event.active) simulation.alphaTarget(0.3).restart()
            d.fx = d.x
            d.fy = d.y
          })
          .on('drag', (event, d: any) => {
            d.fx = event.x
            d.fy = event.y
          })
          .on('end', (event, d: any) => {
            if (!event.active) simulation.alphaTarget(0)
            d.fx = null
            d.fy = null
          })
      )

    node
      .append('circle')
      .attr('r', 8)
      .attr('fill', (d: any) => categoryColors[d.category] || 'oklch(0.70 0.18 200)')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')

    node
      .append('text')
      .attr('dy', 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '8px')
      .attr('fill', 'oklch(0.20 0.05 270)')
      .text((d: any) => d.name)

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y)

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`)
    })

    return () => {
      simulation.stop()
    }
  }, [])

  return (
    <Card className="p-6 overflow-hidden">
      <div className="mb-4">
        <h3 className="text-xl font-bold mb-2">Ecosystem Dependency Graph</h3>
        <p className="text-sm text-muted-foreground">
          Visual representation of all modules and their relationships
        </p>
      </div>
      <div className="w-full overflow-auto">
        <svg
          ref={svgRef}
          width="100%"
          height="600"
          viewBox="0 0 1200 800"
          style={{ background: 'oklch(0.98 0.01 250)', cursor: 'grab' }}
        />
      </div>
    </Card>
  )
}
