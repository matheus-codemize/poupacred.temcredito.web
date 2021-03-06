import React, { useState, useMemo, useEffect } from 'react';
import _ from 'lodash';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styles from './style.module.css';

// redux
import actions from '../../../../redux/actions/simulation';
import actionsContainer from '../../../../redux/actions/container';

// assets
import backgroundImg from '../../../../assets/images/background/panel/simulacao.jpg';

// services
import * as propostaApi from '../../../../services/proposta';
import * as simulacaoApi from '../../../../services/simulacao';

// utils
import toast from '../../../../utils/toast';
import moment from '../../../../utils/moment';
import validator from '../../../../utils/validator';
import language, { errors as errorsLanguage } from '../../../../utils/language';

// resources
import registerDefault from '../../../../resources/data/simulacao/register';

// components
import Box from '../../../../components/Box';
import Panel from '../../../../components/Panel';
import Input from '../../../../components/Input';
import Margin from '../../../../components/Margin';
import Button from '../../../../components/Button';
import Select from '../../../../components/Select';
import Carousel from '../../../../components/Carousel';
import InputFile from '../../../../components/InputFile';
import InputDate from '../../../../components/InputDate';
import RadioGroup from '../../../../components/RadioGroup';

const languagePage = language['page.simulation'];
const languageForm = language['component.form.props'];

const keysStep = Object.keys(registerDefault);
const mapKeyProps = { opcoes: 'options', multiplo: 'multiple' };
const components = {
  input: Input,
  money: Input,
  number: Input,
  select: Select,
  margem: Margin,
  file: InputFile,
  radio: RadioGroup,
  inputdate: InputDate,
};

function CreateSimulation({ ...rest }) {
  // resources hooks
  const history = useHistory();
  const dispatch = useDispatch();

  // redux state
  const auth = useSelector(state => state.auth);
  const simulation = useSelector(state => state.simulation);
  const {
    step,
    steps,
    register,
    stepBlock,
    isProposal,
    isResimulation,
  } = simulation;

  // component state
  const [help, setHelp] = useState('');
  const [error, setError] = useState({});
  const [produtos, setProdutos] = useState([]);
  const [lastStep, setLastStep] = useState(false);

  useEffect(() => {
    initComponent();
  }, []);

  useEffect(() => {
    getClientByCpf();
  }, [register.cpf]);

  useEffect(() => {
    if (step < keysStep.length) {
      setHelp('');
    } else {
      setHelp(
        (steps[step - keysStep.length] &&
          steps[step - keysStep.length].ajuda) ||
          '',
      );

      if (
        step - keysStep.length === steps.length - 1 &&
        !_.get(steps[step - keysStep.length], 'propriedades.step', false)
      ) {
        return setLastStep(true);
      }
    }

    setLastStep(false);
  }, [step, steps]);

  async function initComponent() {
    dispatch(actionsContainer.loading());

    if (
      auth.login &&
      !isProposal &&
      !isResimulation &&
      auth.type === 'client'
    ) {
      dispatch(actions.register({ ...register, cpf: auth.login }));
      dispatch(actions.step(Object.keys(registerDefault).length - 1));
    }

    await Promise.all([getProdutos()]);
    dispatch(actionsContainer.close());
  }

  async function getProdutos() {
    const data = await simulacaoApi.getProdutos();
    setProdutos(data);
  }

  async function getClientByCpf() {
    try {
      const { cpf } = register;
      if (validator.cpf(cpf)) {
        dispatch(actionsContainer.loading());

        let { id, nascimento, ...data } = await simulacaoApi.getClientByCpf(
          cpf,
          false,
        );

        if (moment(nascimento, 'DD/MM/YYYY').isValid()) {
          nascimento = moment(nascimento, 'DD/MM/YYYY').toDate();
        }

        dispatch(actions.register({ ...register, ...data, nascimento }));
      }
    } catch (err) {
    } finally {
      dispatch(actionsContainer.close());
    }
  }

  function unlockStep() {
    if (stepBlock !== -1) dispatch(actions.blockStep());
  }

  function handleBack() {
    if (
      !step ||
      step <= stepBlock ||
      (auth.type === 'client' &&
        step === Object.keys(registerDefault).length - 1)
    ) {
      unlockStep();
      return auth.uid || isResimulation || isProposal
        ? history.goBack()
        : history.replace('/');
    }
    dispatch(actions.backStep());
  }

  async function handleNext(event) {
    try {
      event.preventDefault();

      let response = [];
      const nascimento = moment(register.nascimento).format('DD/MM/YYYY');

      if (step === keysStep.length - 1 && !steps.length) {
        dispatch(actionsContainer.loading());
        response = await simulacaoApi[
          isResimulation ? 'getReFields' : 'getFields'
        ]({ ...register, nascimento });
        dispatch(actions.steps(response));

        if (!response.length) return;
      }

      if (
        step >= keysStep.length &&
        step - keysStep.length === steps.length - 1 &&
        _.get(steps[step - keysStep.length], 'propriedades.step', false)
      ) {
        dispatch(actionsContainer.loading());
        response = await simulacaoApi[
          isResimulation ? 'getReFields' : 'getFields'
        ]({
          ...register,
          nascimento,
          step: steps[step - keysStep.length].propriedades.step,
        });
        dispatch(actions.steps([...steps, ...response]));

        if (!response.length) return;
      }

      dispatch(actions.nextStep());
    } catch (err) {
      const message = _.get(err, 'response.data.erro', err.message);
      toast.error(`Opss .. ${message}`);
    } finally {
      dispatch(actionsContainer.close());
    }
  }

  async function handleSave(event) {
    try {
      event.preventDefault();
      let response, path, state;
      dispatch(actionsContainer.loading());

      if (isProposal) {
        const data = Object.assign({}, register);
        Object.keys(data)
          .filter((_key, index) => index < stepBlock)
          .forEach(key => delete data[key]);
        response = await propostaApi.create(data);
        path = '/sucesso';
        state = { path: '/simulacao', ...languagePage.success };
      } else {
        response = await simulacaoApi.simulate({
          ...register,
          nascimento: moment(register.nascimento).format('DD/MM/YYYY'),
        });
        path = '/simulacao/propostas';
        dispatch(actions.proposals(response.cards));
        dispatch(
          actions.register({
            ...register,
            simulacao_id: response.simulacao_id,
          }),
        );
      }

      if (path) {
        unlockStep();
        history.push(path, state || null);
      }
    } catch (err) {
      const message = _.get(err, 'response.data.erro', err.message);
      toast.error(message);
    } finally {
      dispatch(actionsContainer.close());
    }
  }

  function handleChange(event) {
    let { id, value } = event.target;
    setError(prevError => ({ ...prevError, [id]: '' }));

    switch (id) {
      case keysStep[keysStep.length - 1]:
        return dispatch(actions.initRegister({ [id]: value }));

      default:
        if (
          step >= keysStep.length &&
          step - keysStep.length < steps.length &&
          _.get(steps[step - keysStep.length], 'propriedades.step', false)
        ) {
          return dispatch(actions.lastStep({ id, value }));
        }
        break;
    }

    dispatch(actions.register({ ...register, [id]: value }));
  }

  function handleBlur(event) {
    let message = '';
    const { id, value } = event.target;

    switch (id) {
      case 'cpf':
        if (!value) {
          message = errorsLanguage.empty.replace(
            '[field]',
            languageForm.cpf.label,
          );
        } else if (!validator.cpf(value)) {
          message = errorsLanguage.invalid.replace(
            '[field]',
            languageForm.cpf.label,
          );
        }
        break;

      default:
        break;
    }

    setError(prevError => ({ ...prevError, [id]: message }));
  }

  const renderBtnNext = useMemo(() => {
    let key, disabled;
    const languageButton =
      language[`component.button.${lastStep ? 'register' : 'next'}`];

    if (step < keysStep.length) {
      key = keysStep[step];
      disabled = !!error[key] || !register[key];
    } else if (step - keysStep.length < steps.length) {
      key = steps[step - keysStep.length].id;
      disabled =
        !!error[key] ||
        (!register[key] && steps[step - keysStep.length].requerido);
    }

    return (
      <Button
        data-unique
        htmlType="submit"
        disabled={!!disabled}
        {...languageButton}
      />
    );
  }, [lastStep, error, simulation]);

  const renderSteps = useMemo(() => {
    return steps.map((item, index) => {
      if (Object.prototype.hasOwnProperty.call(item, 'propriedades')) {
        Object.keys(item.propriedades).forEach(key => {
          if (Object.prototype.hasOwnProperty.call(mapKeyProps, key)) {
            switch (key) {
              case 'opcoes':
                item.propriedades[mapKeyProps[key]] = item.propriedades[
                  key
                ].map(optionItem => ({
                  ...optionItem,
                  value: optionItem.id,
                  label: optionItem.nome,
                }));
                break;

              default:
                item.propriedades[mapKeyProps[key]] = item.propriedades[key];
                break;
            }
            delete item.propriedades[key];
          }
        });
      }

      if (Object.prototype.hasOwnProperty.call(components, item.tipo)) {
        return (
          <Carousel.Step key={index}>
            {React.createElement(components[item.tipo], {
              ...item.propriedades,
              id: item.id,
              label: item.titulo,
              onChange: handleChange,
              value: register[item.id] || '',
              ...(['money', 'number'].includes(item.tipo) && {
                type: item.tipo,
              }),
            })}
          </Carousel.Step>
        );
      }
      return <></>;
    });
  }, [simulation, simulation.step, simulation.steps, simulation.register]);

  return (
    <Panel
      useDivider
      background={backgroundImg}
      title={
        languagePage[
          !auth.uid
            ? 'title'
            : isResimulation
            ? 'resimulationTitle'
            : isProposal
            ? 'choosePropostalTitle'
            : 'createTitle'
        ]
      }
    >
      <Panel.Body>
        <form
          className={styles.form}
          onSubmit={lastStep ? handleSave : handleNext}
        >
          <Box size="sm" help={help} onBack={handleBack}>
            <Carousel step={step}>
              <Carousel.Step>
                <Input
                  id="cpf"
                  type="cpf"
                  helpType="error"
                  onBlur={handleBlur}
                  help={error.cpf || ''}
                  onChange={handleChange}
                  value={register.cpf || ''}
                  {...languageForm.cpf}
                />
              </Carousel.Step>
              <Carousel.Step>
                <Input
                  id="nome"
                  onChange={handleChange}
                  value={register.nome || ''}
                  {...languageForm.nome}
                />
              </Carousel.Step>
              <Carousel.Step>
                <InputDate
                  id="nascimento"
                  onChange={handleChange}
                  value={register.nascimento || ''}
                  {...languageForm.nascimento}
                />
              </Carousel.Step>
              <Carousel.Step>
                <Input
                  id="celular"
                  type="phone"
                  onChange={handleChange}
                  value={register.celular || ''}
                  {...languageForm.celular}
                />
              </Carousel.Step>
              <Carousel.Step>
                <Input
                  id="email"
                  htmlType="email"
                  onChange={handleChange}
                  value={register.email || ''}
                  {...languageForm.email}
                />
              </Carousel.Step>
              <Carousel.Step>
                <Select
                  id="produto"
                  options={produtos}
                  onChange={handleChange}
                  value={register.produto || ''}
                  {...languageForm.produto}
                />
              </Carousel.Step>
              {renderSteps}
            </Carousel>
            {renderBtnNext}
          </Box>
        </form>
      </Panel.Body>
    </Panel>
  );
}

export default CreateSimulation;
