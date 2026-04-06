import PropTypes from 'prop-types';
import './LoadingSkeleton.css';

const LoadingSkeleton = ({
    type = 'text',
    count = 1,
    height,
    width,
    className = '',
    ...props
}) => {
    const skeletons = Array.from({ length: count }, (_, index) => index);

    const renderSkeleton = () => {
        switch (type) {
            case 'card':
                return (
                    <div className="skeleton-card">
                        <div className="skeleton-card-image"></div>
                        <div className="skeleton-card-content">
                            <div className="skeleton-line skeleton-title"></div>
                            <div className="skeleton-line skeleton-text"></div>
                            <div className="skeleton-line skeleton-text short"></div>
                        </div>
                    </div>
                );

            case 'list':
                return (
                    <div className="skeleton-list-item">
                        <div className="skeleton-avatar"></div>
                        <div className="skeleton-list-content">
                            <div className="skeleton-line skeleton-text"></div>
                            <div className="skeleton-line skeleton-text short"></div>
                        </div>
                    </div>
                );

            case 'text':
                return (
                    <div
                        className={`skeleton-line ${className}`}
                        style={{ height, width }}
                    ></div>
                );

            case 'circle':
                return (
                    <div
                        className={`skeleton-circle ${className}`}
                        style={{ height, width }}
                    ></div>
                );

            default:
                return (
                    <div
                        className={`skeleton-line ${className}`}
                        style={{ height, width }}
                    ></div>
                );
        }
    };

    return (
        <div className="skeleton-container" {...props}>
            {skeletons.map((index) => (
                <div key={index} className="skeleton-wrapper">
                    {renderSkeleton()}
                </div>
            ))}
        </div>
    );
};

LoadingSkeleton.propTypes = {
    type: PropTypes.oneOf(['text', 'card', 'list', 'circle']),
    count: PropTypes.number,
    height: PropTypes.string,
    width: PropTypes.string,
    className: PropTypes.string,
};

export default LoadingSkeleton;
