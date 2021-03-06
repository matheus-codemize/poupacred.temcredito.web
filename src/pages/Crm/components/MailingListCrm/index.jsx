import React, { useEffect, useMemo, useState } from 'react';
import _ from 'lodash';
import { useDispatch } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import styles from './style.module.css';

// redux
import actionsContainer from '../../../../redux/actions/container';

// services
import * as crmApi from '../../../../services/crm';

// assets
import backgroundImg from '../../../../assets/images/background/panel/crm.jpg';

// utils
import language from '../../../../utils/language';

// components
import Panel from '../../../../components/Panel';
import BoxData from '../../../../components/BoxData';
import CardList from '../../../../components/CardList';

const languagePage = language['page.crm'];

const statusEnable = [1, 4];

function ListMailingCrm() {
  // resources hooks
  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();

  // component state
  const [dataset, setDataset] = useState([]);
  const [details, setDetails] = useState(null);

  useEffect(() => {
    const crm = _.get(location, 'state.crm', null);
    setDetails(crm);
  }, [location.state]);

  useEffect(() => {
    if (details && details.id) getDataset();
  }, [details]);

  async function getDataset() {
    dispatch(actionsContainer.loading());
    const data = await crmApi.getAnswers(details.id);
    setDataset(data);
    dispatch(actionsContainer.close());
  }

  async function handleMailing(mailing) {
    history.push(`${location.pathname}/atendimento`, {
      crm: { ...details, mailing },
    });
  }

  function handleBack() {
    history.goBack();
  }

  const renderDataset = useMemo(() => {
    return dataset.map(item => ({
      ...item,
      cabecalho: [{ valor: item.nome }],
      onClick: () => handleMailing(item),
      disabled: !statusEnable.includes(item.status_id),
      rodape: [
        { nome: languagePage.labels.status, valor: item.status },
        {
          nome: languagePage.labels.scheduleDate,
          valor: item.data || languagePage.labels.scheduleDateEmpty,
        },
      ],
    }));
  }, [dataset]);

  return (
    <Panel
      onBack={handleBack}
      background={backgroundImg}
      title={languagePage.title}
      subtitle={languagePage.mailingTitle}
    >
      <Panel.Body>
        {details && (
          <div className={styles.container}>
            <BoxData useDirection {...details} />
          </div>
        )}
        <CardList data={renderDataset} />
      </Panel.Body>
    </Panel>
  );
}

export default ListMailingCrm;
