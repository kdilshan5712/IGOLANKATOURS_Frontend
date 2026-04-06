import PropTypes from 'prop-types';
import Button from './Button';
import './EmptyState.css';

const EmptyState = ({
    icon: Icon,
    title,
    description,
    action,
    secondaryAction,
    className = '',
    ...props
}) => {
    return (
        <div className={`empty-state ${className}`} {...props}>
            {Icon && (
                <div className="empty-state-icon">
                    <Icon size={64} />
                </div>
            )}

            <h3 className="empty-state-title">{title}</h3>

            {description && (
                <p className="empty-state-description">{description}</p>
            )}

            {(action || secondaryAction) && (
                <div className="empty-state-actions">
                    {action && (
                        <Button
                            variant="primary"
                            onClick={action.onClick}
                            icon={action.icon}
                        >
                            {action.label}
                        </Button>
                    )}

                    {secondaryAction && (
                        <Button
                            variant="outline"
                            onClick={secondaryAction.onClick}
                            icon={secondaryAction.icon}
                        >
                            {secondaryAction.label}
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
};

EmptyState.propTypes = {
    icon: PropTypes.elementType,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    action: PropTypes.shape({
        label: PropTypes.string.isRequired,
        onClick: PropTypes.func.isRequired,
        icon: PropTypes.node,
    }),
    secondaryAction: PropTypes.shape({
        label: PropTypes.string.isRequired,
        onClick: PropTypes.func.isRequired,
        icon: PropTypes.node,
    }),
    className: PropTypes.string,
};

export default EmptyState;
