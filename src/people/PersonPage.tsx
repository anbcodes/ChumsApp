import React from "react";
import { Person, Groups, Tabs, Household, UserHelper, ApiHelper, PersonInterface, Merge, Permissions, PersonHelper } from "./components"
import { Grid, Icon } from "@mui/material"
import { useParams } from "react-router-dom";
import { ImageEditor } from "../appBase/components";

export const PersonPage = () => {
  const params = useParams();
  const [person, setPerson] = React.useState<PersonInterface>(null);
  const [inPhotoEditMode, setInPhotoEditMode] = React.useState<boolean>(false);
  const [showMergeSearch, setShowMergeSearch] = React.useState<boolean>(false);

  const loadData = () => {
    ApiHelper.get("/people/" + params.id, "MembershipApi").then(data => {
      const p: PersonInterface = data;
      if (!p.contactInfo) p.contactInfo = { homePhone: "", workPhone: "", mobilePhone: "" }
      else {
        if (!p.contactInfo.homePhone) p.contactInfo.homePhone = "";
        if (!p.contactInfo.mobilePhone) p.contactInfo.mobilePhone = "";
        if (!p.contactInfo.workPhone) p.contactInfo.workPhone = "";

      }
      setPerson(data)
    }
    );
  }

  const handlePhotoUpdated = (dataUrl: string) => {
    const updatedPerson = { ...person };
    updatedPerson.photo = dataUrl;
    if (!dataUrl) {
      updatedPerson.photoUpdated = null;
    }
    setPerson(updatedPerson);
    setInPhotoEditMode(false);
  }

  const togglePhotoEditor = (show: boolean, updatedPerson?: PersonInterface) => {
    setInPhotoEditMode(show);
    if (updatedPerson) {
      setPerson(updatedPerson)
    }
  }

  const imageEditor = inPhotoEditMode && (
    <ImageEditor
      aspectRatio={4 / 3}
      photoUrl={PersonHelper.getPhotoUrl(person)}
      onCancel={() => togglePhotoEditor(false)}
      onUpdate={handlePhotoUpdated}
    />
  );
  const getGroups = () => (UserHelper.checkAccess(Permissions.membershipApi.groupMembers.view)) ? <Groups personId={person?.id} /> : null

  const handleShowSearch = () => {
    setShowMergeSearch(true)
  }

  const hideMergeBox = () => {
    setShowMergeSearch(false)
  }

  const addMergeSearch = (showMergeSearch) ? <Merge hideMergeBox={hideMergeBox} person={person} /> : <></>;
  React.useEffect(loadData, [params.id]);

  return (
    <>
      <h1><Icon>person</Icon> {person?.name?.display}</h1>
      <Grid container spacing={3}>
        <Grid item md={8} xs={12}>
          <Person id="personDetailsBox" person={person} togglePhotoEditor={togglePhotoEditor} updatedFunction={loadData} showMergeSearch={handleShowSearch} />
          <Tabs person={person} />
        </Grid>
        <Grid item md={4} xs={12}>
          {addMergeSearch}
          {imageEditor}
          <Household person={person} reload={person?.photoUpdated} />
          {getGroups()}
        </Grid>
      </Grid>
    </>
  )

}
