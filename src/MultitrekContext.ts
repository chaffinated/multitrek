import React, { createContext } from 'react';
import { MultitrekState } from './types';
import { initialState } from './state';

const MultitrekContext: React.Context<MultitrekState> = createContext(initialState);

export default MultitrekContext;
export const { Provider, Consumer } = MultitrekContext;
