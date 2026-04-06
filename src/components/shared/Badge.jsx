import PropTypes from 'prop-types';
import './Badge.css';

const Badge = ({
    children,
    variant = 'info',
    size = 'medium',
    icon,
    className = '',
    ...props
}) => {
    const badgeClass = `badge badge-${variant} badge-${size} ${className}`.trim();

    return (
        <span className={badgeClass} {...props}>
            {icon && <span className="badge-icon">{icon}</span>}
            {children}
        </span>
    );
};

Badge.propTypes = {
    children: PropTypes.node.isRequired,
    variant: PropTypes.oneOf(['success', 'warning', 'error', 'info', 'neutral']),
    size: PropTypes.oneOf(['small', 'medium', 'large']),
    icon: PropTypes.node,
    className: PropTypes.string,
};

export default Badge;
