import React, { useRef, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './style.module.css';

// components
import Help from '../Help';
import Label from '../Label';
import Button from '../Button';

// utils
import format from '../../utils/format';
import language from '../../utils/language';

const languageComp = language['component.input'];

function Input({
  id,
  type,
  help,
  label,
  value,
  action,
  display,
  onChange,
  required,
  htmlType,
  disabled,
  helpType,
  placeholder,

  col, // to width
  ...rest
}) {
  const inputRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);

  function handlePassword() {
    if (!disabled) {
      setShowPassword(prevShow => !prevShow);
      inputRef.current.focus();
    }
  }

  function handleChange(event) {
    let { value: valueSelected } = event.target;

    switch (type) {
      case 'cep':
        valueSelected = format.zipcode(valueSelected, value);
        break;

      case 'cpf':
        valueSelected = format.cpf(valueSelected, value);
        break;

      case 'phone':
        valueSelected = format.phone(valueSelected, value);
        break;

      case 'birthday':
        valueSelected = format.birthday(valueSelected, value);
        break;

      case 'money':
        valueSelected = valueSelected.replace(/[^\d]/g, '');
        valueSelected = valueSelected && parseFloat(valueSelected);
        break;

      case 'number':
        valueSelected = valueSelected.replace(/[^\d]/g, '');
        valueSelected = valueSelected && parseInt(valueSelected);
        break;

      default:
        break;
    }

    if (typeof onChange === 'function') {
      onChange({ target: { id, value: valueSelected } });
    }
  }

  const renderPlaceholder = useMemo(() => {
    switch (type) {
      case 'cep':
      case 'cpf':
      case 'money':
      case 'phone':
        return languageComp.placeholder[type];

      default:
        break;
    }

    return placeholder;
  }, [type, placeholder]);

  const renderValue = useMemo(() => {
    if (value) {
      switch (type) {
        case 'money':
          return `${language.currency} ${value}`;

        default:
          break;
      }
    }

    return value;
  }, [type, value]);

  const renderLabel = useMemo(() => {
    return (
      label && (
        <Label
          htmlFor={id}
          text={label}
          display={display}
          required={required}
        />
      )
    );
  }, [id, label, display, required]);

  const renderHelp = useMemo(() => {
    return help && <Help text={help} type={helpType} />;
  }, [help, helpType]);

  const renderAddonPassword = useMemo(() => {
    return htmlType === 'password' ? (
      <i
        onClick={handlePassword}
        className={showPassword ? 'fa fa-eye' : 'fa fa-eye-slash'}
      />
    ) : (
      <></>
    );
  }, [showPassword, htmlType]);

  const renderAction = useMemo(() => {
    return action ? <Button {...action} /> : <></>;
  }, [action]);

  return (
    <div
      data-label={!!label}
      data-display={display}
      className={styles.container}
      data-col={typeof col === 'function' ? col(id) : col}
    >
      {renderLabel}
      <div data-action={!!action} className={styles.content}>
        <input
          {...rest}
          id={id}
          ref={inputRef}
          required={required}
          disabled={disabled}
          value={renderValue}
          onChange={handleChange}
          placeholder={renderPlaceholder}
          type={showPassword ? 'text' : htmlType}
        />
        {renderAction}
      </div>
      {renderHelp}
      {renderAddonPassword}
    </div>
  );
}

Input.defaultProps = {
  col: 16,
  help: '',
  label: '',
  action: null,
  type: 'text',
  required: false,
  disabled: false,
  htmlType: 'text',
  display: 'vertical',
};

Input.propTypes = {
  help: PropTypes.string,
  label: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  action: PropTypes.object,
  helpType: PropTypes.string,
  id: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  display: PropTypes.oneOf(['vertical', 'horizontal']),
  htmlType: PropTypes.oneOf(['text', 'password', 'email']),
  col: PropTypes.oneOfType([PropTypes.func, PropTypes.number]),
  type: PropTypes.oneOf([
    'text',
    'cep',
    'cpf',
    'phone',
    'money',
    'number',
    'birthday',
  ]),
};

export default Input;
