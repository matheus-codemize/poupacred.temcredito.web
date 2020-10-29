import React, { useMemo, useEffect, useState, useRef } from 'react';
import $ from 'jquery';
import { useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import styles from './style.module.css';

// assets
import logo from '../../assets/images/logo.png';

// redux
import actionsAuth from '../../redux/actions/auth';

// components
import Button from '../../components/Button';

// utils
import language from '../../utils/language';

// assets
import Term from '../../assets/documents/politica_privacidade.pdf';
import Polity from '../../assets/documents/politica_privacidade.pdf';

const bannersDesktop = [
  require('../../assets/images/landing/desktop/banner1.jpg'),
  require('../../assets/images/landing/desktop/banner2.jpg'),
  require('../../assets/images/landing/desktop/banner3.jpg'),
];

function Landing() {
  // references
  const headerRef = useRef(null);

  // resources hooks
  const history = useHistory();
  const dispatch = useDispatch();

  // redux state
  const auth = useSelector(state => state.auth);

  // component state
  /**
   * State para controle das animações JS
   */
  const [indexBanner, setIndexBanner] = useState(0);
  const [intervalBanner, setIntervalBanner] = useState(null);
  const [indexStep, setIndexStep] = useState(0);
  const [intervalStep, setIntervalStep] = useState(null);

  const [scroll, setScroll] = useState(0);
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    if (auth.uid) {
      dispatch(actionsAuth.logout());
    }
  }, [auth, auth.uid]);

  useEffect(() => {
    /**
     * Iniciando as animações
     */
    initIntervalStep();
    initIntervalBanner();
  }, []);

  useEffect(() => {
    window.addEventListener('resize', resizeWindow);
    window.addEventListener('scroll', scrollWindow);

    return () => {
      window.removeEventListener('resize', resizeWindow);
      window.removeEventListener('scroll', scrollWindow);
    };
  }, [navigator.userAgent]);

  useEffect(() => {
    const selectors = ['slider_item', 'selector_item'];

    selectors.forEach(selector =>
      $(`.${styles[selector]}`).each(function (i) {
        if (i === indexBanner) {
          $(this).addClass(styles[`${selector}_active`]);
        } else {
          $(this).removeClass(styles[`${selector}_active`]);
        }
      }),
    );
  }, [indexBanner]);

  useEffect(() => {
    const { step_number, step_number_active } = styles;
    $(`.${step_number}`).each(function (i) {
      if (i === indexStep) {
        $(this).addClass(step_number_active);
      } else {
        $(this).removeClass(step_number_active);
      }
    });
  }, [indexStep]);

  function resizeWindow() {
    const { innerWidth } = window;
    setWidth(innerWidth);
  }

  function scrollWindow() {
    const { advantage_title, advantage, animation_visible } = styles;
    const classes = [advantage_title, advantage];

    setScroll(prevScroll => {
      if (headerRef.current) {
        if (!window.scrollY) {
          headerRef.current.style.top = 0;
          headerRef.current.style.position = 'absolute';
        } else {
          setTimeout(() => {
            headerRef.current.style.position = 'fixed';
          }, 400);

          if (prevScroll > window.scrollY) {
            headerRef.current.style.top = 0;
          } else {
            headerRef.current.style.top = `-${
              headerRef.current.offsetHeight + 5
            }px`;
          }
        }

        if (prevScroll > 80) {
          headerRef.current.classList.add(styles.header_block);
        } else {
          headerRef.current.classList.remove(styles.header_block);
        }
      }
      return window.scrollY;
    });

    if (!navigator.userAgent.toLowerCase().includes('mobile')) {
      classes.forEach(classSelector => {
        $(`.${classSelector}`).each(function () {
          const top_of_object = $(this).offset().top;
          const bottom_of_window = $(window).scrollTop() + $(window).height();
          if (parseInt(bottom_of_window) >= parseInt(top_of_object)) {
            $(this).addClass(animation_visible);
          } else {
            $(this).removeClass(animation_visible);
          }
        });
      });
    }
  }

  function initIntervalBanner() {
    const idInterval = setInterval(setBanner, 5000);
    setIntervalBanner(idInterval);
    return () => clearInterval(idInterval);
  }

  function restartIntervalBanner() {
    clearInterval(intervalBanner);
    initIntervalBanner();
  }

  async function setBanner(index) {
    if (index !== undefined) {
      setIndexBanner(index);
      return restartIntervalBanner();
    }

    setIndexBanner(prevIndex =>
      prevIndex === bannersDesktop.length - 1 ? 0 : prevIndex + 1,
    );
  }

  function initIntervalStep() {
    const idInterval = setInterval(setStep, 5000);
    setIntervalStep(idInterval);
    return () => clearInterval(idInterval);
  }

  function restartIntervalStep() {
    clearInterval(intervalStep);
    initIntervalStep();
  }

  function setStep(index) {
    if (index !== undefined) {
      setIndexStep(index);
      return restartIntervalStep();
    }

    setIndexStep(prevIndex =>
      prevIndex === language['landing.steps'].length - 1 ? 0 : prevIndex + 1,
    );
  }

  function handleSimulation() {
    history.push('/register/client');
  }

  function handleClient() {
    history.push('/login', { login: { type: 'client' } });
  }

  function handleAgent() {
    history.push('/register/agent');
  }

  function handleTop() {
    $('html, body').animate({ scrollTop: 0 });
  }

  function handleLogin() {
    history.push('/login');
  }

  const renderTitle = useMemo(() => {
    if (indexBanner < language['landing.banners'].length) {
      const { title, subtitle, position } = language['landing.banners'][
        indexBanner
      ];
      return (
        <div
          id="container-title"
          className={styles.container_title}
          style={
            width >= 700
              ? {
                  transform: `translateX(${position})`,
                }
              : {}
          }
        >
          <h1>{title}</h1>
          {/* {subtitle && <p>{subtitle}</p>} */}
        </div>
      );
    }
    return <></>;
  }, [width, indexBanner]);

  const bannerPosition = useMemo(() => {
    if (navigator.userAgent.toLowerCase().includes('mobile')) {
      // mobile
      switch (indexBanner) {
        case 0:
          return '15%';

        case 1:
          return '20%';

        case 2:
          return '70%';

        default:
          break;
      }
    } else {
      // desktop
      switch (indexBanner) {
        case 1:
          return '30%';

        case 2:
          return '70%';

        default:
          break;
      }
    }
    return 0;
  }, [indexBanner]);

  return (
    <div className={styles.container}>
      <head ref={headerRef} className={styles.header}>
        <img src={logo} onClick={handleTop} />
        <Button onClick={handleLogin} {...language['component.button.login']} />
      </head>
      <section className={styles.section_header}>
        {bannersDesktop.map((banner, index) => (
          <div
            key={index}
            className={styles.slider_item}
            style={{
              backgroundImage: `url(${banner})`,
              backgroundPosition: bannerPosition,
            }}
          />
        ))}
        {renderTitle}
        <div className={styles.container_action}>
          <Button icon="fa fa-calculator" onClick={handleSimulation}>
            {language['landing.button.simulation.text']}
          </Button>
          <Button icon="fa fa-user" onClick={handleClient}>
            {language['landing.button.client.text']}
          </Button>
          <Button
            gradient
            type="secondary"
            icon="fa fa-user-tie"
            onClick={handleAgent}
          >
            {language['landing.button.agent.text']}
          </Button>
        </div>
        <div className={styles.container_selector}>
          {bannersDesktop.map((_banner, index) => (
            <div
              key={index}
              onClick={() => setBanner(index)}
              className={styles.selector_item}
            />
          ))}
        </div>
      </section>
      <section className={styles.section_step}>
        <h1 className={styles.step_title}>{language['landing.step.title']}</h1>
        <p className={styles.step_description}>
          {language['landing.step.subtitle']}
        </p>
        <div className={styles.container_step}>
          {language['landing.steps'].map((step, index) => (
            <div key={index} className={styles.step}>
              <div className={styles.step_number}>{index + 1}</div>
              <h1>{step.title}</h1>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </section>
      <section className={styles.section_advantage}>
        <h1 className={styles.advantage_title}>
          {language['landing.advantage.title']}
        </h1>
        {language['landing.advantages'].map((advantage, index) => (
          <div key={index} className={styles.advantage}>
            <h1>{advantage.title}</h1>
            <div
              className={styles.advantage_item_description}
              dangerouslySetInnerHTML={{ __html: advantage.description }}
            />
          </div>
        ))}
      </section>
      <section className={styles.section_feature}>
        {language['landing.features'].map((feature, index) => (
          <div key={index} className={styles.feature}>
            <i className={`fa ${feature.icon}`} />
            <h1>{feature.title}</h1>
            {feature.descriptions.map((description, indexD) => (
              <p key={indexD}>{description}</p>
            ))}
          </div>
        ))}
      </section>
      <section className={styles.section_footer}>
        <div className={styles.container_term_policy}>
          <h1>{language['title']}</h1>
          <ul>
            <li>
              <a href={Term} target="_blank" className={styles.footer_link}>
                {language['term']}
              </a>
            </li>
            <li>
              <a href={Polity} target="_blank" className={styles.footer_link}>
                {language['polity']}
              </a>
            </li>
          </ul>
        </div>
        <div className={styles.container_contacts}>
          {language['landing.footer'].contacts.map((contact, index) => (
            <div className={styles.contact} key={index}>
              <i className={`fa ${contact.icon}`} />
              <div dangerouslySetInnerHTML={{ __html: contact.text }} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Landing;
