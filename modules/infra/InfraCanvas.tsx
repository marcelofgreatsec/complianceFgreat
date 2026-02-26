'use client';

import { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, Text, Group, Arrow, Line } from 'react-konva';
import * as LucideIcons from 'lucide-react';

interface CanvasProps {
    elements: any[];
    setElements: (elements: any[]) => void;
    selectedTool: string;
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

export default function InfraCanvas({ elements, setElements, selectedTool }: CanvasProps) {
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

    const handleDragEnd = (e: any, id: string) => {
        // Simple snapping to 10px grid
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
            stroke: '#00c8ff', // Cyan highlight
        };
        setElements([...elements, newArrow]);
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

    // Helper to render icon-like shapes (simplified for Konva)
    const renderIcon = (type: string, fill: string) => {
        // Enforce specific colors for types if needed
        return (
            <Rect
                width={40}
                height={40}
                x={10}
                y={10}
                fill={fill || 'rgba(0, 112, 209, 0.2)'}
                cornerRadius={8}
                stroke="rgba(255, 255, 255, 0.2)"
                strokeWidth={1}
            />
        );
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
                {/* Visual Grid Dots (Optional but nice) */}
                {elements.map((el) => {
                    if (el.type === 'arrow') {
                        return (
                            <Arrow
                                key={el.id}
                                points={el.points}
                                stroke={el.stroke || '#888'}
                                fill={el.stroke || '#888'}
                                strokeWidth={2}
                                pointerLength={8}
                                pointerWidth={8}
                                lineCap="round"
                                lineJoin="round"
                                draggable={selectedTool === 'select'}
                                opacity={0.8}
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

                    const isSelected = false; // Add selection logic if needed

                    return (
                        <Group
                            key={el.id}
                            x={el.x}
                            y={el.y}
                            draggable={selectedTool === 'select'}
                            onDragEnd={(e) => handleDragEnd(e, el.id)}
                            onClick={() => {
                                if (selectedTool === 'select') {
                                    // Handle selection
                                }
                            }}
                        >
                            {/* Card Background */}
                            <Rect
                                width={el.width || 140}
                                height={el.height || 60}
                                fill="rgba(30, 30, 30, 0.85)"
                                cornerRadius={12}
                                stroke={isSelected ? '#0070d1' : 'rgba(255, 255, 255, 0.1)'}
                                strokeWidth={isSelected ? 2 : 1}
                                shadowBlur={15}
                                shadowOpacity={0.4}
                                shadowColor="black"
                            />

                            {/* Icon Placeholder/Simulated */}
                            <Circle
                                x={25}
                                y={30}
                                radius={15}
                                fill={el.fill || '#0070d1'}
                                opacity={0.2}
                            />

                            {/* Component Text */}
                            <Text
                                text={el.text || el.type.toUpperCase()}
                                fontSize={13}
                                fontStyle="bold"
                                fill="#ffffff"
                                x={45}
                                y={23}
                                width={90}
                                align="left"
                            />

                            <Text
                                text={el.subtext || 'Component'}
                                fontSize={10}
                                fill="#888888"
                                x={45}
                                y={38}
                                width={90}
                                align="left"
                            />
                        </Group>
                    );
                })}
            </Layer>
        </Stage>
    );
}
