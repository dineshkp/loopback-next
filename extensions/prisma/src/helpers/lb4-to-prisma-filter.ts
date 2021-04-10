import {Filter, InclusionFilter} from '@loopback/repository';
import {cloneDeep} from 'lodash';
import {PrismaGenericTypes} from '../types';

export function lb4ToPrismaFilter(lb4Filter: Filter) {
  lb4Filter = cloneDeep(lb4Filter);
  const prismaFilter: PrismaGenericTypes.Filter = {};

  // Fields filter mapping
  if (lb4Filter.fields) {
    prismaFilter.select = {};

    if (Array.isArray(lb4Filter.fields)) {
      for (const field in lb4Filter.fields) {
        prismaFilter.select[field] = true;
      }
    } else {
      for (const field in lb4Filter.fields) {
        prismaFilter.select[field] = lb4Filter.fields[field]!;
      }
    }
  }

  // Order filter mapping
  if (lb4Filter.order) {
    prismaFilter.orderBy = {};
    for (const order in lb4Filter.order) {
      const [prop, direction] = order.split(' ');

      if (!['asc', 'desc'].includes(direction.toLowerCase()))
        throw new Error('Invalid direciton');

      prismaFilter.orderBy[prop] =
        <'asc' | 'desc'>direction.toLowerCase() ?? 'asc';
    }
  }
}

export function lb4ToPrismaIncludeFilter(lb4Filter: InclusionFilter[]) {
  // for (const include of lb4Filter) {
  //   if (typeof include === 'string') {
  //   } else lb4ToPrismaIncludeFilter([include]);
  // }
}
