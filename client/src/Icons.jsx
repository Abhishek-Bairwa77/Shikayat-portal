import React from 'react';

// 1. Base Component jo Bootstrap icon render karega
export const Icon = ({ name, size = 20, className = '', color, style = {} }) => {
  const iconClass = name.startsWith('bi-') ? name : `bi-${name}`;
  return (
    <i
      className={`bi ${iconClass} ${className}`}
      style={{
        fontSize: `${size}px`,
        color: color,
        display: 'inline-block',
        verticalAlign: 'middle',
        lineHeight: 1,
        ...style
      }}
    ></i>
  );
};

// 2. Saare Icons ke Variables
export const Icons = {
  Logo: (props) => <Icon name="mortarboard" {...props} />,
  Dashboard: (props) => <Icon name="grid-1x2" {...props} />,
  User: (props) => <Icon name="person" {...props} />,
  Admin: (props) => <Icon name="shield-check" {...props} />,
  Logout: (props) => <Icon name="box-arrow-right" {...props} />,
  Settings: (props) => <Icon name="gear" {...props} />,
  Plus: (props) => <Icon name="plus-lg" {...props} />,
  Close: (props) => <Icon name="x-lg" {...props} />,
  Check: (props) => <Icon name="check" {...props} />,
  ArrowUp: (props) => <Icon name="arrow-up" {...props} />,
  ChevronDown: (props) => <Icon name="chevron-down" {...props} />,
  Loader: (props) => <Icon name="arrow-clockwise" {...props} />,
  Lock: (props) => <Icon name="lock-fill" {...props} />,
  Shield: (props) => <Icon name="shield-lock" {...props} />,
  Key: (props) => <Icon name="key" {...props} />,
  Alert: (props) => <Icon name="exclamation-triangle" {...props} />,
  Flame: (props) => <Icon name="fire" {...props} />,
  StatusSubmitted: (props) => <Icon name="file-earmark-text" {...props} />,
  StatusReview: (props) => <Icon name="search" {...props} />,
  StatusProgress: (props) => <Icon name="arrow-repeat" {...props} />,
  StatusResolved: (props) => <Icon name="check-circle-fill" {...props} />,
  Vote: (props) => <Icon name="hand-thumbs-up" {...props} />,
  Chart: (props) => <Icon name="bar-chart" {...props} />,
  Inbox: (props) => <Icon name="inbox" {...props} />,
  FileText: (props) => <Icon name="file-text" {...props} />,
  Clipboard: (props) => <Icon name="clipboard-data" {...props} />,
  Camera: (props) => <Icon name="camera" {...props} />,
  Upload: (props) => <Icon name="cloud-arrow-up" {...props} />,
  Paperclip: (props) => <Icon name="paperclip" {...props} />,
  Delete: (props) => <Icon name="backspace" {...props} />,
};