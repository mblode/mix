import React from 'react'
import { Color, Vector2 } from './RYB';

interface Props {
  center?: Vector2
  radius?: number
  startAngle?: number
  endAngle?: number
  segments?: number
  color: Color
}

export const Segment: React.FC<Props> = ({ color }) => {
  return (
    <div className="inline-block h-5 w-1" style={{ backgroundColor: `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})` }}>
    </div>
  );
}