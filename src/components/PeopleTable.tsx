import React, { useMemo } from 'react';
import classNames from 'classnames';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { PersonLink } from './PersonLink';
import { getSearchWith, SearchParams } from '../utils/searchHelper';
import { Person } from '../types';

type Props = {
  people: Person[];
  sort: string | null;
  order: string | null;
};

export const PeopleTable: React.FC<Props> = ({ people, sort, order }) => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();

  const peopleByName = useMemo(() => {
    const map: { [key: string]: Person } = {};

    people.forEach(person => {
      map[person.name] = person;
    });

    return map;
  }, [people]);

  const renderHeader = (field: string, label: string) => {
    const isCurrentSort = sort === field;
    const isDesc = order === 'desc';

    let nextParams: SearchParams = {};

    if (!isCurrentSort) {
      nextParams = { sort: field, order: null };
    } else if (!isDesc) {
      nextParams = { sort: field, order: 'desc' };
    } else {
      nextParams = { sort: null, order: null };
    }

    const nextSearch = getSearchWith(searchParams, nextParams);

    return (
      <th>
        <span className="is-flex is-flex-wrap-nowrap">
          {label}
          <Link to={{ search: nextSearch }}>
            <span className="icon">
              <i
                className={classNames('fas', {
                  'fa-sort': !isCurrentSort,
                  'fa-sort-down': isCurrentSort && !isDesc,
                  'fa-sort-up': isCurrentSort && isDesc,
                })}
              />
            </span>
          </Link>
        </span>
      </th>
    );
  };

  return (
    <table
      data-cy="peopleTable"
      className="table is-striped is-hoverable is-narrow is-fullwidth"
    >
      <thead>
        <tr>
          {renderHeader('name', 'Name')}
          {renderHeader('sex', 'Sex')}
          {renderHeader('born', 'Born')}
          {renderHeader('died', 'Died')}
          <th>Mother</th>
          <th>Father</th>
        </tr>
      </thead>

      <tbody>
        {people.map(person => {
          const motherLink = person.motherName
            ? peopleByName[person.motherName]
            : null;
          const fatherLink = person.fatherName
            ? peopleByName[person.fatherName]
            : null;

          return (
            <tr
              data-cy="person"
              key={person.slug}
              className={slug === person.slug ? 'has-background-warning' : ''}
            >
              <td>
                <PersonLink person={person} />
              </td>

              <td>{person.sex}</td>
              <td>{person.born}</td>
              <td>{person.died}</td>
              <td>
                {!person.motherName ? (
                  '-'
                ) : motherLink ? (
                  <PersonLink person={motherLink} />
                ) : (
                  person.motherName
                )}
              </td>
              <td>
                {!person.fatherName ? (
                  '-'
                ) : fatherLink ? (
                  <PersonLink person={fatherLink} />
                ) : (
                  person.fatherName
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
