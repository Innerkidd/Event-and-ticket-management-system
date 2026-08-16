import React from 'react';

const Skeleton = ({ width = '100%', height = '20px', borderRadius = '8px', className = '', style = {} }) => {
  return (
    <div
      className={`skeleton-loader ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
    />
  );
};

export default Skeleton;
