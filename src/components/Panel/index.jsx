import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import $ from 'jquery';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import styles from './style.module.css';

// utils
import language from '../../utils/language';

// redux
import actionsContainer from '../../redux/actions/container';
import { useLocation } from 'react-router-dom';

const languageComp = language['component.panel'];

function PanelSearch({ ...rest }) {
  return <div {...rest} />;
}

function PanelBody({ ...rest }) {
  return <div {...rest} />;
}

function Panel({
  title,
  actions,
  subtitle,
  children,
  onSearch,
  background,
  useDivider,
  ...rest
}) {
  // references
  const body = useRef(null);
  const header = useRef(null);
  const search = useRef(null);

  // resources hooks
  const dispatch = useDispatch();
  const location = useLocation();

  // redux state
  const navigator = useSelector(state => state.navigator);

  // component state
  const [showAction, setShowAction] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);
  const [searchSizeShow, setSearchSizeShow] = useState(0);
  const [searchSizeTotal, setSearchSizeTotal] = useState(0);
  const [topOfActions, setTopOfActions] = useState(0);

  useEffect(() => {
    if (header.current) {
      console.log('entrou');
      /**
       * ajuste do elemento ´div search´
       */
      if (search.current) {
        search.current.style.maxHeight = openSearch
          ? `calc(100vh - ${search.current.offsetTop}px - 8rem)`
          : 'auto';
      }

      /**
       * ajuste do elemento ´section body´
       */
      if (body.current && !openSearch) {
        const { offsetHeight } = header.current;
        body.current.style.top = showAction
          ? `calc(${offsetHeight}px + 7rem)`
          : offsetHeight;
        body.current.style.height = `calc(100vh - ${offsetHeight}px - 2rem${
          showAction ? ' - 7rem' : ''
        })`;
      }
    }
  });

  useEffect(() => {
    $(window).scrollTop(0);
  }, []);

  useEffect(() => {
    window.removeEventListener('scroll', blockActions);
    window.addEventListener('scroll', blockActions);

    return () => {
      window.removeEventListener('scroll', blockActions);
    };
  }, [topOfActions]);

  function blockActions() {
    const action = document.getElementById('section_action');

    if (action) {
      if (!topOfActions) return setTopOfActions(action.offsetTop);

      if (window.pageYOffset >= topOfActions) {
        action.classList.add(styles.action_block);
      } else {
        action.classList.remove(styles.action_block);
      }
    }
  }

  function handleActions() {
    dispatch(actionsContainer.open());
  }

  const renderTitle = useMemo(() => {
    return (
      title &&
      (typeof title === 'string' ? (
        <div
          className={styles.title}
          dangerouslySetInnerHTML={{ __html: title }}
        />
      ) : (
        React.cloneElement(title, { className: styles.title })
      ))
    );
  }, [title]);

  const renderSubtitle = useMemo(() => {
    return (
      subtitle &&
      (typeof subtitle === 'string' ? (
        <div
          className={styles.subtitle}
          dangerouslySetInnerHTML={{ __html: subtitle }}
        />
      ) : (
        React.cloneElement(subtitle, { className: styles.subtitle })
      ))
    );
  }, [subtitle]);

  const renderSearchOptions = useMemo(() => {
    let searchChildren = [];
    const element = React.Children.toArray(children).find(
      child => child.type === PanelSearch,
    );

    if (element) {
      searchChildren = React.Children.toArray(element.props.children);
      setSearchSizeTotal(searchChildren.length);

      if (!openSearch) {
        searchChildren = searchChildren.filter(
          (_child, index) =>
            (navigator.window.size.x < 800 && index <= 1) ||
            (navigator.window.size.x >= 800 &&
              navigator.window.size.x < 1000 &&
              index <= 2) ||
            (navigator.window.size.x >= 1000 && index <= 3),
        );
      }
      setSearchSizeShow(searchChildren.length);

      return (
        <div ref={search} className={styles.search}>
          {searchChildren}
        </div>
      );
    }

    return <></>;
  }, [children, openSearch, navigator.window.size]);

  const renderActionsHeader = useMemo(() => {
    const actionsHeader = [...actions];

    if (typeof onSearch === 'function') {
      actionsHeader.push({
        ...language['component.button.search'],
        onClick: onSearch,
      });
    }

    if (searchSizeTotal) {
      if (openSearch || searchSizeShow !== searchSizeTotal) {
        actionsHeader.push({
          text: languageComp[openSearch ? 'minus' : 'more'],
          icon: `fas fa-chevron-circle-${openSearch ? 'up' : 'down'}`,
          onClick: () => setOpenSearch(prevOpenSearch => !prevOpenSearch),
        });
      }
    }

    setShowAction(actionsHeader.length > 0);

    if (navigator.window.size.x < 600 && actionsHeader.length > 2) {
      return (
        <section id="section_action" className={styles.actions}>
          <button onClick={handleActions}>
            <i className={language['component.button.action'].icon} />
            {language['component.button.action'].text}
          </button>
        </section>
      );
    }

    return (
      actionsHeader.length > 0 && (
        <section id="section_action" className={styles.actions}>
          {actionsHeader.map(({ icon, text, onClick }, index) => (
            <button
              key={index}
              onClick={typeof onClick === 'function' ? onClick : undefined}
            >
              {icon && <i className={icon} />}
              {text || ''}
            </button>
          ))}
        </section>
      )
    );
  }, [
    actions,
    onSearch,
    openSearch,
    searchSizeShow,
    searchSizeTotal,
    navigator.window.size,
  ]);

  const renderBody = useMemo(() => {
    const element = React.Children.toArray(children).find(
      child => child.type === PanelBody,
    );
    return element || <></>;
  }, [children]);

  return (
    <div
      data-open={openSearch}
      data-action={showAction}
      data-divider={useDivider}
      className={styles.container}
    >
      <section
        ref={header}
        className={styles.header}
        style={{
          [background ? 'backgroundImage' : 'background']: background
            ? `linear-gradient(to bottom, rgba(var(--color-primary), 0.5), rgb(var(--color-primary)) 70%) , url(${background})`
            : 'rgb(var(--color-primary))',
        }}
      >
        {renderTitle}
        {renderSubtitle}
        {renderSearchOptions}
      </section>
      {renderActionsHeader}
      <section ref={body} className={styles.body}>
        {renderBody}
      </section>
    </div>
  );
}

Panel.Body = PanelBody;
Panel.Search = PanelSearch;

Panel.defaultProps = {
  actions: [],
  subtitle: '',
  background: '',
  onSearch: null,
  useDivider: false,
};

Panel.propTypes = {
  onSearch: PropTypes.func,
  useDivider: PropTypes.bool,
  background: PropTypes.string,
  actions: PropTypes.arrayOf(PropTypes.object),
  subtitle: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
  children: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.arrayOf(PropTypes.node),
  ]),
};

export default Panel;
