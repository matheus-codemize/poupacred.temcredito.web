import actionsTypes from '../constants/container';

const actions = {
  open: data => ({
    type: actionsTypes.UPDATE,
    payload: { open: true, loading: false, ...data },
  }),
  close: () => ({
    type: actionsTypes.UPDATE,
    payload: { open: false, loading: false, color: 'black', onClose: () => {} },
  }),
  loading: data => ({
    type: actionsTypes.UPDATE,
    payload: { open: true, loading: true, color: 'black', ...data },
  }),
  sidebar: data => ({
    type: actionsTypes.UPDATE,
    payload: { open: true, color: 'white', ...data },
  }),
};

export default actions;
