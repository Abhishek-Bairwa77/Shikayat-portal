const AppIcon = ({ name, size = 20, color, className = '', style = {} }) => {
  // Agar user ne 'bi-' prefix nahi lagaya, toh hum automatically laga denge
  const iconClass = name.startsWith('bi-') ? name : `bi-${name}`;

  return (
    <i
      className={`bi ${iconClass} ${className}`}
      style={{
        fontSize: `${size}px`, // Bootstrap icons size ko fontSize se control karte hain
        color: color,
        lineHeight: 1,
        display: 'inline-block',
        verticalAlign: 'middle',
        ...style
      }}
    ></i>
  );
};

export default AppIcon;