import React from 'react';
import { useDroppable } from '@dnd-kit/core';

export function Droppable({ id, children }) {
    const { setNodeRef } = useDroppable({
        id
    });

    return (
        <div ref={setNodeRef} style={{ flex: 1 }}>
            {children}
        </div>
    );
}