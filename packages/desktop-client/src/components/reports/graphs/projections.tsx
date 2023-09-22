import React from 'react';

import * as d from 'date-fns';

import q, { runQuery } from 'loot-core/src/client/query-helpers';
import { send } from 'loot-core/src/platform/client/fetch';
import * as monthUtils from 'loot-core/src/shared/months';
import {
  integerToCurrency,
  integerToAmount,
  amountToInteger,
} from 'loot-core/src/shared/util';

import AlignedText from '../../common/AlignedText';
import { index } from '../util';

export default function percentiles(conditions = [], conditionsOp) {
  return async (setData) => {
    let { filters } = await send('make-filters-from-conditions', {
      conditions: conditions.filter(cond => !cond.customName),
    });
    const conditionsOpKey = conditionsOp === 'or' ? '$or' : '$and';

    let trans = await Promise.all([
      runQuery(
        q('transactions')
          .filter({
            [conditionsOpKey]: filters,
          })
          .groupBy({ $month: '$date' })
          // .calculate({ $sum: '$amount' })
          .select([
            { date: { $month: '$date' } },
            { amount: { $sum: '$amount' } },
          ]),
      ).then(({ data }) => data),
    ]);
    let entries = [...trans.entries()][0][1];
    let monthly_values = [];
    for (let value of entries) {
      monthly_values.push(value.amount);
    }
    console.log(monthly_values);
    let projections = generateLists(monthly_values);

    const cumSums = projections.map(list => cumulativeSum(list));
    cumSums.sort((a, b) => a[a.length - 1] - b[b.length - 1]);

    // Select the 25th and 75th list
    const list25thPercentile = cumSums[24]; // Remember, arrays are 0-based indexed, so the 25th item is at index 24.
    const list75thPercentile = cumSums[74];

    console.log('25th Percentile List:', list25thPercentile);
    console.log('75th Percentile List:', list75thPercentile);
    return setData({
      list25thPercentile,
      list75thPercentile,
    })
  };
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Function to generate 100 lists of length 12 from trans
function generateLists(trans) {
  const lists = [];

  for (let i = 0; i < 100; i++) {
    const tempList = [];

    for (let j = 0; j < 12; j++) {
      const randomIndex = getRandomInt(0, trans.length - 1);
      tempList.push(trans[randomIndex]);
    }

    lists.push(tempList);
  }

  return lists;
}

function cumulativeSum(arr) {
  return arr.reduce((acc, value, index) => {
    if (index === 0) {
      acc.push(value);
    } else {
      acc.push(acc[index - 1] + value);
    }
    return acc;
  }, []);
}
