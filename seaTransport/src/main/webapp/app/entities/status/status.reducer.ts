import axios from 'axios';
import {
  parseHeaderForLinks,
  loadMoreDataWhenScrolled,
  ICrudGetAction,
  ICrudGetAllAction,
  ICrudPutAction,
  ICrudDeleteAction,
} from 'react-jhipster';

import { cleanEntity } from 'app/shared/util/entity-utils';
import { REQUEST, SUCCESS, FAILURE } from 'app/shared/reducers/action-type.util';

import { IStatus, defaultValue } from 'app/shared/model/status.model';

export const ACTION_TYPES = {
  FETCH_STATUS_LIST: 'status/FETCH_STATUS_LIST',
  FETCH_STATUS: 'status/FETCH_STATUS',
  CREATE_STATUS: 'status/CREATE_STATUS',
  UPDATE_STATUS: 'status/UPDATE_STATUS',
  PARTIAL_UPDATE_STATUS: 'status/PARTIAL_UPDATE_STATUS',
  DELETE_STATUS: 'status/DELETE_STATUS',
  RESET: 'status/RESET',
};

const initialState = {
  loading: false,
  errorMessage: null,
  entities: [] as ReadonlyArray<IStatus>,
  entity: defaultValue,
  links: { next: 0 },
  updating: false,
  totalItems: 0,
  updateSuccess: false,
};

export type StatusState = Readonly<typeof initialState>;

// Reducer

export default (state: StatusState = initialState, action): StatusState => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.FETCH_STATUS_LIST):
    case REQUEST(ACTION_TYPES.FETCH_STATUS):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        loading: true,
      };
    case REQUEST(ACTION_TYPES.CREATE_STATUS):
    case REQUEST(ACTION_TYPES.UPDATE_STATUS):
    case REQUEST(ACTION_TYPES.DELETE_STATUS):
    case REQUEST(ACTION_TYPES.PARTIAL_UPDATE_STATUS):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        updating: true,
      };
    case FAILURE(ACTION_TYPES.FETCH_STATUS_LIST):
    case FAILURE(ACTION_TYPES.FETCH_STATUS):
    case FAILURE(ACTION_TYPES.CREATE_STATUS):
    case FAILURE(ACTION_TYPES.UPDATE_STATUS):
    case FAILURE(ACTION_TYPES.PARTIAL_UPDATE_STATUS):
    case FAILURE(ACTION_TYPES.DELETE_STATUS):
      return {
        ...state,
        loading: false,
        updating: false,
        updateSuccess: false,
        errorMessage: action.payload,
      };
    case SUCCESS(ACTION_TYPES.FETCH_STATUS_LIST): {
      const links = parseHeaderForLinks(action.payload.headers.link);

      return {
        ...state,
        loading: false,
        links,
        entities: loadMoreDataWhenScrolled(state.entities, action.payload.data, links),
        totalItems: parseInt(action.payload.headers['x-total-count'], 10),
      };
    }
    case SUCCESS(ACTION_TYPES.FETCH_STATUS):
      return {
        ...state,
        loading: false,
        entity: action.payload.data,
      };
    case SUCCESS(ACTION_TYPES.CREATE_STATUS):
    case SUCCESS(ACTION_TYPES.UPDATE_STATUS):
    case SUCCESS(ACTION_TYPES.PARTIAL_UPDATE_STATUS):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: action.payload.data,
      };
    case SUCCESS(ACTION_TYPES.DELETE_STATUS):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: {},
      };
    case ACTION_TYPES.RESET:
      return {
        ...initialState,
      };
    default:
      return state;
  }
};

const apiUrl = 'api/statuses';

// Actions

export const getEntities: ICrudGetAllAction<IStatus> = (page, size, sort) => {
  const requestUrl = `${apiUrl}${sort ? `?page=${page}&size=${size}&sort=${sort}` : ''}`;
  return {
    type: ACTION_TYPES.FETCH_STATUS_LIST,
    payload: axios.get<IStatus>(`${requestUrl}${sort ? '&' : '?'}cacheBuster=${new Date().getTime()}`),
  };
};

export const getEntity: ICrudGetAction<IStatus> = id => {
  const requestUrl = `${apiUrl}/${id}`;
  return {
    type: ACTION_TYPES.FETCH_STATUS,
    payload: axios.get<IStatus>(requestUrl),
  };
};

export const createEntity: ICrudPutAction<IStatus> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.CREATE_STATUS,
    payload: axios.post(apiUrl, cleanEntity(entity)),
  });
  return result;
};

export const updateEntity: ICrudPutAction<IStatus> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.UPDATE_STATUS,
    payload: axios.put(`${apiUrl}/${entity.id}`, cleanEntity(entity)),
  });
  return result;
};

export const partialUpdate: ICrudPutAction<IStatus> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.PARTIAL_UPDATE_STATUS,
    payload: axios.patch(`${apiUrl}/${entity.id}`, cleanEntity(entity)),
  });
  return result;
};

export const deleteEntity: ICrudDeleteAction<IStatus> = id => async dispatch => {
  const requestUrl = `${apiUrl}/${id}`;
  const result = await dispatch({
    type: ACTION_TYPES.DELETE_STATUS,
    payload: axios.delete(requestUrl),
  });
  return result;
};

export const reset = () => ({
  type: ACTION_TYPES.RESET,
});
