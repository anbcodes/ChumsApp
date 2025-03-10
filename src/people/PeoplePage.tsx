import React from "react";
import { PersonInterface } from "../appBase/interfaces";
import { PeopleSearchResults, ApiHelper, DisplayBox, ExportLink, PeopleColumns } from "./components";
import { Grid, Icon } from "@mui/material"
import { ChumsPersonHelper } from "../helpers";
import { PeopleSearch } from "./components/PeopleSearch";
import useMountedState from "../appBase/hooks/useMountedState";

export const PeoplePage = () => {

  const [searchResults, setSearchResults] = React.useState(null);
  const [selectedColumns, setSelectedColumns] = React.useState<string[]>(["photo", "displayName"]);
  const isMounted = useMountedState();

  const columns = [
    { key: "photo", label: "Photo", shortName: "" },
    { key: "displayName", label: "Display Name", shortName: "Name" },
    { key: "lastName", label: "Last Name", shortName: "Last" },
    { key: "firstName", label: "First Name", shortName: "First" },
    { key: "middleName", label: "Middle Name", shortName: "Middle" },
    { key: "address", label: "Address", shortName: "Address" },
    { key: "city", label: "City", shortName: "City" },
    { key: "state", label: "State", shortName: "State" },
    { key: "zip", label: "Zip", shortName: "Zip" },
    { key: "email", label: "Primary Email", shortName: "Email" },
    { key: "phone", label: "Primary Phone", shortName: "Phone" },
    { key: "birthDate", label: "Birthdate", shortName: "Birthdate" },
    { key: "birthDay", label: "Birthday (No Year)", shortName: "Birthday" },
    { key: "age", label: "Age", shortName: "Age" },
    { key: "gender", label: "Gender", shortName: "Gender" },
    { key: "membershipStatus", label: "Membership Status", shortName: "Membership" },
    { key: "maritalStatus", label: "Marital Status", shortName: "Married" },
    { key: "anniversary", label: "Anniversary", shortName: "Anniversary" },
    { key: "nametagNotes", label: "Name Tag Notes", shortName: "Notes" }
  ];

  const loadData = () => {
    ApiHelper.get("/people/recent", "MembershipApi").then(data => {
      if(!isMounted()) {
        return;
      }
      setSearchResults(data.map((d: PersonInterface) => ChumsPersonHelper.getExpandedPersonObject(d)))
    });
  }

  const handleToggleColumn = (key: string) => {
    let sc = [...selectedColumns];
    const index = sc.indexOf(key);
    if (index === -1) sc.push(key);
    else sc.splice(index, 1);
    setSelectedColumns(sc);
  }

  const getEditContent = () => {
    if (searchResults == null) return <></>;
    else return (<>
      <ExportLink data={searchResults} filename="people.csv" /> &nbsp;
      <PeopleColumns selectedColumns={selectedColumns} toggleColumn={handleToggleColumn} columns={columns} />
    </>);
  }

  React.useEffect(loadData, [isMounted]);

  return (
    <>
      <h1><Icon>person</Icon> Search People</h1>
      <Grid container spacing={3}>
        <Grid item md={8} xs={12}>
          <DisplayBox id="peopleBox" headerIcon="person" headerText="People" editContent={getEditContent()}>
            <PeopleSearchResults people={searchResults} columns={columns} selectedColumns={selectedColumns} />
          </DisplayBox>
        </Grid>
        <Grid item md={4} xs={12}>
          <PeopleSearch updateSearchResults={(people) => setSearchResults(people)} />
        </Grid>
      </Grid>
    </>
  );
}
