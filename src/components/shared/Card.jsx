import PropTypes from 'prop-types';
import './Card.css';

const Card = ({
    children,
    hoverable = false,
    gradient = false,
    gradientColor = 'blue',
    padding = 'medium',
    className = '',
    onClick,
    ...props
}) => {
    const cardClass = `
    card 
    ${hoverable ? 'card-hoverable' : ''} 
    ${gradient ? `card-gradient card-gradient-${gradientColor}` : ''}
    card-padding-${padding}
    ${className}
  `.trim().replace(/\s+/g, ' ');

    return (
        <div className={cardClass} onClick={onClick} {...props}>
            {children}
        </div>
    );
};

Card.propTypes = {
    children: PropTypes.node.isRequired,
    hoverable: PropTypes.bool,
    gradient: PropTypes.bool,
    gradientColor: PropTypes.oneOf(['blue', 'gold', 'green', 'red']),
    padding: PropTypes.oneOf(['none', 'small', 'medium', 'large']),
    className: PropTypes.string,
    onClick: PropTypes.func,
};

export default Card;
