import {isEmpty} from 'lodash';

const getScheduleByType = (entityId, semesterId) => ({});

const isNotReadySchedule = (schedule, loading) => isEmpty(schedule) && !loading;

const filterClassesArray = (inputArray = []) => {
    const safeArray = Array.isArray(inputArray) ? inputArray : [];

    if (isEmpty(safeArray)) {
        return [];
    }

    return safeArray.filter((item, index, array) => {
        const resIndex = array.findIndex((findItem) => findItem.id === item.id);
        return resIndex === index;
    });
};

export { getScheduleByType, isNotReadySchedule, filterClassesArray };