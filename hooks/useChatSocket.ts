import { useEffect } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { RootState } from '../store';
import { socketService } from '../services/socketService';

export const useChatSocket = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.auth);

    const store = useStore<RootState>();

    useEffect(() => {
        // Initialize the socket service with the dispatch
        socketService.initialize(dispatch, store.getState);
    }, [dispatch, store]);

    useEffect(() => {
        // Only connect if the user is authenticated
        if (user) {
            socketService.connect();
        } else {
            socketService.disconnect();
        }
    }, [user]);

    return socketService;
};
