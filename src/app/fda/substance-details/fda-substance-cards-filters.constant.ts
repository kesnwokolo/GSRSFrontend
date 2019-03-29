import { SubstanceCardFilter } from '@gsrs-core/substance-details/substance-cards-filter.model';
import { SubstanceDetail } from '@gsrs-core/substance/substance.model';
import { SubstanceCardFilterParameters } from '@gsrs-core/config/config.model';

export const fdaSubstanceCardsFilters: Array<SubstanceCardFilter> = [
    {
        name: 'fdaSample',
        filter: fdaSampleFilter
    }
];

export function fdaSampleFilter(
    substance: SubstanceDetail,
    filter: SubstanceCardFilterParameters
): boolean {
    return true;
}
