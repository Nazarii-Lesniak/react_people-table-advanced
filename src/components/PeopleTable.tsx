import React, { useMemo } from 'react';
import classNames from 'classnames';
import { Link, useParams } from 'react-router-dom';
import { PersonLink } from './PersonLink';
import { getSearchWith, SearchParams } from '../utils/searchHelper';
import { Person } from '../types';

type Props = {
  people: Person[];
  searchParams: URLSearchParams;
};

export const PeopleTable: React.FC<Props> = ({ people, searchParams }) => {
  const { slug } = useParams();
  const sort = searchParams.get('sort');
  const order = searchParams.get('order');
  const searchString = searchParams.toString();

  const peopleByName = useMemo(() => {
    const map: { [key: string]: Person[] } = {};

    people.forEach(person => {
      if (!map[person.name]) {
        map[person.name] = [];
      }
      map[person.name].push(person);
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

    return (
      <th>
        <span className="is-flex is-flex-wrap-nowrap">
          {label}
          <Link to={{ search: getSearchWith(searchParams, nextParams) }}>
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
          const mothers = person.motherName ? peopleByName[person.motherName] : undefined;
          const fathers = person.fatherName ? peopleByName[person.fatherName] : undefined;

          return (
            <tr
              key={person.slug}
              data-cy="person"
              className={slug === person.slug ? 'has-background-warning' : ''}
            >
              <td>
                <PersonLink person={person} search={searchString} />
              </td>
              <td>{person.sex}</td>
              <td>{person.born}</td>
              <td>{person.died}</td>
              <td>
                {person.motherName ? (
                  mothers?.length === 1 ? (
                    <PersonLink
                      person={mothers[0]}
                      search={searchString}
                    />
                  ) : (
                    person.motherName
                  )
                ) : (
                  '-'
                )}
              </td>
              <td>
                {person.fatherName ? (
                  fathers?.length === 1 ? (
                    <PersonLink
                      person={fathers[0]}
                      search={searchString}
                    />
                  ) : (
                    person.fatherName
                  )
                ) : (
                  '-'
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
