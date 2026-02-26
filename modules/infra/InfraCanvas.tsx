'use client';

import { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, Text, Group, Arrow, Line } from 'react-konva';
import * as LucideIcons from 'lucide-react';

interface CanvasProps {
    elements: any[];
    setElements: (elements: any[]) => void;
    selectedTool: string;
    selectedId: string | null;
    setSelectedId: (id: string | null) => void;
}

// Map tool types to Lucide Icons for rendering
const ICON_MAP: Record<string, any> = {
    server: LucideIcons.Server,
    firewall: LucideIcons.Shield,
    switch: LucideIcons.Network,
    cloud: LucideIcons.Cloud,
    rect: LucideIcons.Box,
    database: LucideIcons.Database,
    loadbalancer: LucideIcons.Cpu,
};

export default function InfraCanvas({ elements, setElements, selectedTool, selectedId, setSelectedId }: CanvasProps) {
    const [isDrawing, setIsDrawing] = useState(false);
    const stageRef = useRef<any>(null);
    const [dimensions, setDimensions] = useState({ width: 1000, height: 800 });

    useEffect(() => {
        const updateSize = () => {
            const container = document.getElementById('canvas-parent');
            if (container) {
                setDimensions({
                    width: container.offsetWidth,
                    height: container.offsetHeight
                });
            }
        };
        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    const handleDragStart = (e: any, id: string) => {
        setSelectedId(id);
    };

    const handleDragEnd = (e: any, id: string) => {
        const x = Math.round(e.target.x() / 10) * 10;
        const y = Math.round(e.target.y() / 10) * 10;
        e.target.position({ x, y });

        setElements(elements.map(el => {
            if (el.id === id) {
                return { ...el, x, y };
            }
            return el;
        }));
    };

    const handleMouseDown = (e: any) => {
        // Deselect if clicking on stage empty area
        if (e.target === e.target.getStage()) {
            setSelectedId(null);
        }

        if (selectedTool !== 'arrow') return;

        const stage = e.target.getStage();
        const pos = stage.getPointerPosition();
        const stageX = stage.x();
        const stageY = stage.y();
        const scale = stage.scaleX();
        const x = (pos.x - stageX) / scale;
        const y = (pos.y - stageY) / scale;

        setIsDrawing(true);
        const newArrow = {
            id: Date.now().toString(),
            type: 'arrow',
            points: [x, y, x, y],
            stroke: 'var(--accent-secondary)', // Ciano FG
            fill: 'var(--accent-secondary)',
        };
        setElements([...elements, newArrow]);
        setSelectedId(newArrow.id);
    };

    const handleMouseMove = (e: any) => {
        if (!isDrawing || selectedTool !== 'arrow') return;
        const stage = e.target.getStage();
        const pos = stage.getPointerPosition();
        const stageX = stage.x();
        const stageY = stage.y();
        const scale = stage.scaleX();
        const x = (pos.x - stageX) / scale;
        const y = (pos.y - stageY) / scale;

        const currentElements = [...elements];
        const lastArrow = currentElements[currentElements.length - 1];
        if (lastArrow) {
            lastArrow.points = [lastArrow.points[0], lastArrow.points[1], x, y];
            setElements(currentElements);
        }
    };

    const handleMouseUp = () => {
        setIsDrawing(false);
    };

    return (
        <Stage
            ref={stageRef}
            width={dimensions.width}
            height={dimensions.height}
            draggable={selectedTool === 'hand'}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            style={{ background: 'transparent' }}
        >
            <Layer>
                {elements.map((el) => {
                    const isSelected = selectedId === el.id;
                    if (el.type === 'arrow') {
                        return (
                            <Arrow
                                key={el.id}
                                points={el.points}
                                stroke={isSelected ? 'var(--accent-primary)' : 'var(--accent-secondary)'}
                                fill={isSelected ? 'var(--accent-primary)' : 'var(--accent-secondary)'}
                                strokeWidth={isSelected ? 4 : 2}
                                pointerLength={10}
                                pointerWidth={10}
                                lineCap="round"
                                lineJoin="round"
                                draggable={selectedTool === 'select'}
                                opacity={isSelected ? 1 : 0.6}
                                onClick={() => setSelectedId(el.id)}
                                onDragStart={(e) => handleDragStart(e, el.id)}
                                onDragEnd={(e) => {
                                    const dx = e.target.x();
                                    const dy = e.target.y();
                                    e.target.position({ x: 0, y: 0 });
                                    setElements(elements.map(item => {
                                        if (item.id === el.id) {
                                            return {
                                                ...item,
                                                points: [item.points[0] + dx, item.points[1] + dy, item.points[2] + dx, item.points[3] + dy]
                                            };
                                        }
                                        return item;
                                    }));
                                }}
                            />
                        );
                    }

                    return (
                        <Group
                            key={el.id}
                            x={el.x}
                            y={el.y}
                            draggable={selectedTool === 'select'}
                            onDragStart={(e) => handleDragStart(e, el.id)}
                            onDragEnd={(e) => handleDragEnd(e, el.id)}
                            onClick={() => setSelectedId(el.id)}
                            onMouseEnter={(e) => {
                                if (selectedTool === 'select') {
                                    const stage = e.target.getStage();
                                    if (stage) stage.container().style.cursor = 'pointer';
                                }
                            }}
                            onMouseLeave={(e) => {
                                const stage = e.target.getStage();
                                if (stage) stage.container().style.cursor = '';
                            }}
                        >
                            {/* Card Background - Ultra Premium FG Style */}
                            <Rect
                                width={el.width || 165}
                                height={el.height || 75}
                                fill="rgba(10, 12, 16, 0.98)"
                                cornerRadius={12}
                                stroke={isSelected ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.08)'}
                                strokeWidth={isSelected ? 3 : 1}
                                shadowBlur={30}
                                shadowOpacity={0.6}
                                shadowColor="black"
                                shadowOffset={{ x: 0, y: 15 }}
                            />

                            {/* Accent Column (Laranja FG) */}
                            <Rect
                                width={6}
                                height={75}
                                fill="var(--accent-primary)"
                                cornerRadius={[12, 0, 0, 12]}
                            />

                            {/* Icon Accent Circle (Ciano FG) */}
                            <Circle
                                x={32}
                                y={38}
                                radius={18}
                                fill="var(--accent-secondary)"
                                opacity={0.12}
                            />

                            {/* Icon Center Dot */}
                            <Circle x={32} y={38} radius={5} fill="var(--accent-secondary)" />

                            {/* Name */}
                            <Text
                                text={el.text || el.type.toUpperCase()}
                                fontSize={14}
                                fontStyle="800"
                                fill="#ffffff"
                                x={55}
                                y={23}
                                width={100}
                                align="left"
                                letterSpacing={-0.3}
                            />

                            {/* Subtext */}
                            <Text
                                text={el.subtext || 'Componente'}
                                fontSize={11}
                                fontWeight="500"
                                fill="rgba(255, 255, 255, 0.4)"
                                x={55}
                                y={42}
                                width={100}
                                align="left"
                            />
                        </Group>
                    );
                })}
            </Layer>
        </Stage>
    );
}
