import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, Line, Text, Transformer } from 'react-konva';
import { Move, Hand, Circle as CircleIcon, Square, Minus, Brush, Eraser, Type, Trash2, Palette } from 'lucide-react';
import '../styles/whiteboard/whiteboard.css';

const tools = [
    { name: 'move', icon: Move },
    { name: 'hand', icon: Hand },
    { name: 'circle', icon: CircleIcon },
    { name: 'rectangle', icon: Square },
    { name: 'line', icon: Minus },
    { name: 'brush', icon: Brush },
    { name: 'eraser', icon: Eraser },
    { name: 'text', icon: Type },
    { name: 'clear', icon: Trash2 },
];

const Whiteboard = () => {
    const [selectedTool, setSelectedTool] = useState('brush');
    const [shapes, setShapes] = useState(() => {
        // Initialize shapes from localStorage if available
        const savedShapes = localStorage.getItem('whiteboardShapes');
        return savedShapes ? JSON.parse(savedShapes) : [];
    });
    const [currentColor, setCurrentColor] = useState('#000000');
    const [brushSize, setBrushSize] = useState(5);
    const [colorPickerVisible, setColorPickerVisible] = useState(false);
    const [selectedShapeId, setSelectedShapeId] = useState(null);
    const [selectedTextId, setSelectedTextId] = useState(null);

    const stageRef = useRef(null);
    const layerRef = useRef(null);
    const transformerRef = useRef(null);
    const isDrawingRef = useRef(false);
    const currentLineRef = useRef(null);

    // Save shapes to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('whiteboardShapes', JSON.stringify(shapes));
    }, [shapes]);

    // Save stage position and scale
    const saveStageState = () => {
        if (stageRef.current) {
            const position = stageRef.current.position();
            const scale = stageRef.current.scale();
            localStorage.setItem('whiteboardStage', JSON.stringify({
                position,
                scale
            }));
        }
    };

    // Add transformer effect for text elements
    useEffect(() => {
        if (selectedTextId && transformerRef.current && layerRef.current) {
            const selectedNode = layerRef.current.findOne('#' + selectedTextId);
            if (selectedNode) {
                transformerRef.current.nodes([selectedNode]);
                transformerRef.current.getLayer().batchDraw();
            }
        } else if (transformerRef.current) {
            transformerRef.current.nodes([]);
            transformerRef.current.getLayer().batchDraw();
        }
    }, [selectedTextId]);

    // Restore stage position and scale
    useEffect(() => {
        const savedStage = localStorage.getItem('whiteboardStage');
        if (savedStage && stageRef.current) {
            const { position, scale } = JSON.parse(savedStage);
            stageRef.current.position(position);
            stageRef.current.scale(scale);
            stageRef.current.batchDraw();
        }
    }, []);

    const handleTextDragEnd = (e, id) => {
        const node = e.target;
        setShapes(prev => prev.map(shape =>
            shape.id === id
                ? { ...shape, x: node.x(), y: node.y() }
                : shape
        ));
    };

    const handleMouseDown = (e) => {
        if (!stageRef.current) return;

        const stage = stageRef.current;
        const point = stage.getRelativePointerPosition();

        if (!point) return;

        isDrawingRef.current = false;
        currentLineRef.current = null;
        setSelectedTextId(null);

        if (selectedTool === 'move') {
            const clickedShape = e.target;
            if (clickedShape && clickedShape.attrs.id) {
                const shape = shapes.find(s => s.id === clickedShape.attrs.id);
                if (shape && shape.type === 'text') {
                    setSelectedTextId(shape.id);
                    return;
                }
                setSelectedShapeId(clickedShape.attrs.id);
            }
            return;
        }

        if (selectedTool === 'hand') {
            stage.container().style.cursor = 'grabbing';
            stage.startDrag();
            return;
        }

        if (['rectangle', 'circle', 'line', 'brush', 'eraser'].includes(selectedTool)) {
            isDrawingRef.current = true;
            const shapeId = Date.now().toString();

            if (selectedTool === 'brush' || selectedTool === 'eraser') {
                const newLine = {
                    id: shapeId,
                    type: selectedTool,
                    points: [point.x, point.y],
                    stroke: selectedTool === 'eraser' ? '#ffffff' : currentColor,
                    strokeWidth: selectedTool === 'eraser' ? brushSize * 3 : brushSize,
                };
                currentLineRef.current = newLine;
                setShapes(prev => [...prev, newLine]);
            } else {
                const newShape = createInitialShape(shapeId, point);
                if (newShape) {
                    currentLineRef.current = newShape;
                    setShapes(prev => [...prev, newShape]);
                }
            }
        }

        if (selectedTool === 'text') {
            const text = prompt('Enter text:');
            if (text) {
                const textPosition = stage.getRelativePointerPosition();
                const newText = {
                    id: Date.now().toString(),
                    type: 'text',
                    x: textPosition.x,
                    y: textPosition.y,
                    text: text,
                    fontSize: 20,
                    fill: currentColor,
                    draggable: true,
                };
                setShapes(prev => [...prev, newText]);
            }
            return;
        }
    };

    const createInitialShape = (shapeId, point) => {
        switch (selectedTool) {
            case 'rectangle':
                return {
                    id: shapeId,
                    type: 'rectangle',
                    x: point.x,
                    y: point.y,
                    width: 0,
                    height: 0,
                    fill: 'transparent',
                    stroke: currentColor,
                    strokeWidth: brushSize,
                };
            case 'circle':
                return {
                    id: shapeId,
                    type: 'circle',
                    x: point.x,
                    y: point.y,
                    radius: 0,
                    fill: 'transparent',
                    stroke: currentColor,
                    strokeWidth: brushSize,
                };
            case 'line':
                return {
                    id: shapeId,
                    type: 'line',
                    points: [point.x, point.y],
                    stroke: currentColor,
                    strokeWidth: brushSize,
                };
            default:
                return null;
        }
    };

    const handleMouseMove = (e) => {
        if (!stageRef.current || !isDrawingRef.current || !currentLineRef.current) return;

        const stage = stageRef.current;
        const point = stage.getRelativePointerPosition();

        if (!point) return;

        setShapes(prev => {
            const lastShape = currentLineRef.current;
            if (!lastShape || !lastShape.id) return prev;

            return prev.map(shape => {
                if (shape.id === lastShape.id) {
                    switch (shape.type) {
                        case 'rectangle':
                            return {
                                ...shape,
                                width: point.x - shape.x,
                                height: point.y - shape.y,
                            };
                        case 'circle':
                            return {
                                ...shape,
                                radius: Math.sqrt(
                                    Math.pow(point.x - shape.x, 2) +
                                    Math.pow(point.y - shape.y, 2)
                                ),
                            };
                        case 'line':
                            return {
                                ...shape,
                                points: [shape.points[0], shape.points[1], point.x, point.y],
                            };
                        case 'brush':
                        case 'eraser':
                            return {
                                ...shape,
                                points: [...shape.points, point.x, point.y],
                            };
                        default:
                            return shape;
                    }
                }
                return shape;
            });
        });
    };

    const handleMouseUp = () => {
        isDrawingRef.current = false;
        currentLineRef.current = null;
        setSelectedShapeId(null);

        if (stageRef.current) {
            stageRef.current.container().style.cursor = 'default';
            saveStageState(); // Save stage state after dragging
        }
    };

    const clearCanvas = () => {
        setShapes([]);
        localStorage.removeItem('whiteboardShapes');
        localStorage.removeItem('whiteboardStage');
        if (stageRef.current) {
            stageRef.current.position({ x: 0, y: 0 });
            stageRef.current.scale({ x: 1, y: 1 });
            stageRef.current.batchDraw();
        }
    };

    const renderShape = (shape) => {
        const commonProps = {
            id: shape.id,
            draggable: selectedTool === 'move',
        };

        switch (shape.type) {
            case 'rectangle':
                return (
                    <Rect
                        key={shape.id}
                        {...commonProps}
                        x={shape.x}
                        y={shape.y}
                        width={shape.width}
                        height={shape.height}
                        fill={shape.fill}
                        stroke={shape.stroke}
                        strokeWidth={shape.strokeWidth}
                    />
                );
            case 'circle':
                return (
                    <Circle
                        key={shape.id}
                        {...commonProps}
                        x={shape.x}
                        y={shape.y}
                        radius={shape.radius}
                        fill={shape.fill}
                        stroke={shape.stroke}
                        strokeWidth={shape.strokeWidth}
                    />
                );
            case 'line':
            case 'brush':
            case 'eraser':
                return (
                    <Line
                        key={shape.id}
                        {...commonProps}
                        points={shape.points}
                        stroke={shape.stroke}
                        strokeWidth={shape.strokeWidth}
                        lineCap="round"
                        lineJoin="round"
                    />
                );
            case 'text':
                return (
                    <Text
                        key={shape.id}
                        {...commonProps}
                        x={shape.x}
                        y={shape.y}
                        text={shape.text}
                        fontSize={shape.fontSize}
                        fill={shape.fill}
                        onDragEnd={(e) => handleTextDragEnd(e, shape.id)}
                        onClick={() => setSelectedTextId(shape.id)}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="whiteboard-container">
            <Stage
                width={window.innerWidth}
                height={window.innerHeight}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                draggable={selectedTool === 'hand'}
                ref={stageRef}
            >
                <Layer ref={layerRef}>
                    {shapes.map(renderShape)}
                </Layer>
            </Stage>
            <div className="toolbar">
                {tools.map((tool) => (
                    <button
                        key={tool.name}
                        className={`tool-button ${selectedTool === tool.name ? 'active' : ''}`}
                        onClick={() => {
                            if (tool.name === 'clear') {
                                clearCanvas();
                            } else {
                                setSelectedTool(tool.name);
                                if (tool.name === 'hand') {
                                    if (stageRef.current) {
                                        stageRef.current.container().style.cursor = 'grab';
                                    }
                                } else if (stageRef.current) {
                                    stageRef.current.container().style.cursor = 'default';
                                }
                            }
                        }}
                    >
                        <tool.icon size={24} />
                    </button>
                ))}
                <button
                    className={`tool-button ${colorPickerVisible ? 'active' : ''}`}
                    onClick={() => setColorPickerVisible(!colorPickerVisible)}
                >
                    <Palette size={24} />
                </button>
                {colorPickerVisible && (
                    <>
                        <input
                            type="color"
                            value={currentColor}
                            onChange={(e) => setCurrentColor(e.target.value)}
                            style={{
                                width: '40px',
                                height: '40px',
                                padding: '0',
                                border: 'none',
                                background: 'none'
                            }}
                        />
                        <input
                            type="range"
                            min="1"
                            max="20"
                            value={brushSize}
                            onChange={(e) => setBrushSize(Number(e.target.value))}
                            style={{ width: '100px', margin: '0 10px' }}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default Whiteboard;