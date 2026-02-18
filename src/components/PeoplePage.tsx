import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { PeopleFilters } from './PeopleFilters';
import { PeopleTable } from './PeopleTable';
import { Loader } from './Loader';
import { getPeople } from '../api';
import { Person } from '../types';

export const PeoplePage = () => {
  const [people, setPeople] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  const [searchParams] = useSearchParams();

  const query = searchParams.get('query');
  const sex = searchParams.get('sex');
  const centuries = searchParams.getAll('centuries');

  const sortParams = searchParams.get('sort');
  const orderParams = searchParams.get('order');

  useEffect(() => {
    setIsLoading(true);
    getPeople()
      .then(dataFromServer => setPeople(dataFromServer))
      .catch(() => setHasError(true))
      .finally(() => setIsLoading(false));
  }, []);

  const visiblePeople = people.filter(person => {
    if (sex && person.sex !== sex) {
      return false;
    }

    if (centuries.length > 0) {
      const century = String(Math.ceil(person.born / 100));
      if (!centuries.includes(century)) {
        return false;
      }
    }

    if (query) {
      const normalizedQuery = query.toLowerCase().trim();
      const nameMatch = person.name
        .toLowerCase()
        .trim()
        .includes(normalizedQuery);

      const motherMatch = person.motherName
        ? person.motherName.toLowerCase().trim().includes(normalizedQuery)
        : false;

      const fatherMatch = person.fatherName
        ? person.fatherName.toLowerCase().trim().includes(normalizedQuery)
        : false;

      if (!nameMatch && !motherMatch && !fatherMatch) {
        return false;
      }
    }

    return true;
  });

  if (sortParams) {
    visiblePeople.sort((personA, personB) => {
      switch (sortParams) {
        case 'name':
          return personA.name.localeCompare(personB.name);
        case 'sex':
          return personA.sex.localeCompare(personB.sex);
        case 'born':
          return personA.born - personB.born;
        case 'died':
          return personA.died - personB.died;
        default:
          return 0;
      }
    });

    if (orderParams === 'desc') {
      visiblePeople.reverse();
    }
  }

  return (
    <>
      <h1 className="title">People Page</h1>

      <div className="block">
        <div className="columns is-desktop is-flex-direction-row-reverse">
          {!hasError && !isLoading && people.length > 0 && (
            <div className="column is-7-tablet is-narrow-desktop">
              <PeopleFilters />
            </div>
          )}

          <div className="column">
            <div className="box table-container">
              {isLoading && <Loader />}

              {hasError && (
                <p data-cy="peopleLoadingError">Something went wrong</p>
              )}

              {!isLoading && !hasError && people.length === 0 && (
                <p data-cy="noPeopleMessage">
                  There are no people on the server
                </p>
              )}

              {people.length > 0 && visiblePeople.length === 0 && (
                <p>There are no people matching the current search criteria</p>
              )}

              {!isLoading && !hasError && people.length > 0 && (
                <PeopleTable
                  people={visiblePeople}
                  sort={sortParams}
                  order={orderParams}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
