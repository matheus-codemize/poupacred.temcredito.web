import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import styles from './style.module.css';

function Button({
  icon,
  type,
  dark,
  light,
  text,
  loading,
  disabled,
  children,
  gradient,
  htmlType,
  ...rest
}) {
  const renderIcon = useMemo(() => {
    return icon && <i className={loading ? 'fas fa-spinner fa-spin' : icon} />;
  }, [icon, loading]);

  const classNameComponent = useMemo(() => {
    let c = styles.button;

    if (type === 'link') {
      return c + ' ' + styles.button_link;
    }

    if (light) c += ` ${styles[type + '-light']}`;
    else if (dark) c += ` ${styles[type + '-dark']}`;
    else if (gradient) c += ` ${styles[type + '-gradient']}`;
    else c += ` ${styles[type]}`;
    return c;
  }, [type, dark, light, gradient]);

  return (
    <button
      {...rest}
      type={htmlType}
      data-type={type}
      className={classNameComponent}
      disabled={disabled || loading}
      data-text={!!(children || text)}
    >
      {renderIcon}
      {children || text || <></>}
    </button>
  );
}

Button.defaultProps = {
  icon: '',
  text: '',
  light: false,
  children: '',
  loading: false,
  disabled: false,
  gradient: false,
  type: 'primary',
  htmlType: 'button',
};

Button.propTypes = {
  dark: PropTypes.bool,
  light: PropTypes.bool,
  icon: PropTypes.string,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  gradient: PropTypes.bool,
  type: PropTypes.oneOf(['link', 'primary', 'secondary']),
  htmlType: PropTypes.oneOf(['button', 'submit', 'reset']),
  text: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
};

export default Button;
