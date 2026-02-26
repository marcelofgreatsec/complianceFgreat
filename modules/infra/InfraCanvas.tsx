'use client';

import { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, Text, Group, Arrow } from 'react-konva';
import * as LucideIcons from 'lucide-react';

interface CanvasProps {
    elements: any[];
    setElements: (elements: any[]) => void;
    selectedTool: string;
    selectedId: string | null;
    setSelectedId: (id: string | null) => void;
}

export default function InfraCanvas({ elements, setElements, selectedTool, selectedId, setSelectedId }: CanvasProps) {
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

        // Update elements
        const updatedElements = elements.map(el => {
            if (el.id === id) {
                return { ...el, x, y };
            }
            return el;
        });

        // Update arrows that depend on this element
        setElements(updatedElements.map(el => {
            if (el.type === 'arrow' && (el.sourceId || el.targetId)) {
                const source = updatedElements.find(item => item.id === el.sourceId);
                const target = updatedElements.find(item => item.id === el.targetId);

                if (source && target) {
                    return {
                        ...el,
                        points: [source.x + 82, source.y + 40, target.x + 82, target.y + 40]
                    };
                }
            }
            return el;
        }));
    };

    const handleMouseDown = (e: any) => {
        if (e.target === e.target.getStage()) {
            setSelectedId(null);
        }
    };

    return (
        <Stage
            ref={stageRef}
            width={dimensions.width}
            height={dimensions.height}
            onMouseDown={handleMouseDown}
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
                                opacity={isSelected ? 1 : 0.6}
                                onClick={(e) => {
                                    e.cancelBubble = true;
                                    setSelectedId(el.id);
                                }}
                            />
                        );
                    }

                    return (
                        <Group
                            key={el.id}
                            x={el.x}
                            y={el.y}
                            draggable
                            onDragStart={(e) => handleDragStart(e, el.id)}
                            onDragEnd={(e) => handleDragEnd(e, el.id)}
                            onClick={(e) => {
                                e.cancelBubble = true;
                                setSelectedId(el.id);
                            }}
                            onMouseEnter={(e) => {
                                const stage = e.target.getStage();
                                if (stage) stage.container().style.cursor = 'grab';
                            }}
                            onMouseLeave={(e) => {
                                const stage = e.target.getStage();
                                if (stage) stage.container().style.cursor = '';
                            }}
                        >
                            {/* Card Background */}
                            <Rect
                                width={el.width || 165}
                                height={el.height || 75}
                                fill="rgba(10, 12, 16, 0.98)"
                                cornerRadius={12}
                                stroke={isSelected ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.08)'}
                                strokeWidth={isSelected ? 3 : 1}
                                shadowBlur={isSelected ? 40 : 20}
                                shadowOpacity={0.6}
                                shadowColor="black"
                                shadowOffset={{ x: 0, y: 15 }}
                            />

                            {/* Accent Column */}
                            <Rect
                                width={6}
                                height={75}
                                fill="var(--accent-primary)"
                                cornerRadius={[12, 0, 0, 12]}
                            />

                            {/* Icon Circle */}
                            <Circle
                                x={32}
                                y={38}
                                radius={18}
                                fill="var(--accent-secondary)"
                                opacity={0.12}
                            />
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
                                text={el.subtext || 'Ativo'}
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
