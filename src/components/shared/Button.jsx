import PropTypes from 'prop-types';
import './Button.css';

const Button = ({
    children,
    variant = 'primary',
    size = 'medium',
    icon,
    iconPosition = 'left',
    disabled = false,
    loading = false,
    onClick,
    type = 'button',
    className = '',
    fullWidth = false,
    ...props
}) => {
    const buttonClass = `btn btn-${variant} btn-${size} ${fullWidth ? 'btn-full-width' : ''} ${className} ${disabled || loading ? 'btn-disabled' : ''}`.trim();

    return (
        <button
            type={type}
            className={buttonClass}
            onClick={onClick}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <>
                    <span className="btn-spinner"></span>
                    Loading...
                </>
            ) : (
                <>
                    {icon && iconPosition === 'left' && <span className="btn-icon">{icon}</span>}
                    {children}
                    {icon && iconPosition === 'right' && <span className="btn-icon">{icon}</span>}
                </>
            )}
        </button>
    );
};

Button.propTypes = {
    children: PropTypes.node.isRequired,
    variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'danger', 'ghost']),
    size: PropTypes.oneOf(['small', 'medium', 'large']),
    icon: PropTypes.node,
    iconPosition: PropTypes.oneOf(['left', 'right']),
    disabled: PropTypes.bool,
    loading: PropTypes.bool,
    onClick: PropTypes.func,
    type: PropTypes.oneOf(['button', 'submit', 'reset']),
    className: PropTypes.string,
};

export default Button;
