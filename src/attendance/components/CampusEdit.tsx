import React from "react";
import { CampusInterface, InputBox, ApiHelper, ErrorMessages } from "./";
import { SelectChangeEvent, TextField } from "@mui/material";

interface Props { campus: CampusInterface, updatedFunction: () => void }

export const CampusEdit: React.FC<Props> = (props) => {
  const [campus, setCampus] = React.useState({} as CampusInterface);
  const [errors, setErrors] = React.useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | SelectChangeEvent<string>) => {
    setErrors([]);
    const c = { ...campus } as CampusInterface;
    let value = e.target.value;
    switch (e.target.name) {
      case "name": c.name = value; break;
    }
    setCampus(c);
  }

  const validate = () => {
    const result = [];
    if (!campus.name) result.push("Campus name is required.");
    setErrors(result);
    return result.length === 0;
  }

  const handleSave = () => {
    if (validate()) {
      ApiHelper.post("/campuses", [campus], "AttendanceApi").then(props.updatedFunction).finally(() => { setIsSubmitting(false) })
    }
  }

  const handleDelete = () => { if (window.confirm("Are you sure you wish to permanently delete this campus?")) ApiHelper.delete("/campuses/" + campus.id, "AttendanceApi").then(props.updatedFunction); }

  React.useEffect(() => setCampus(props.campus), [props.campus]);

  if (campus === null || campus.id === undefined) return null;

  return (
    <InputBox id="campusBox" data-cy="campus-box" cancelFunction={props.updatedFunction} saveFunction={handleSave} deleteFunction={props.campus?.id ? handleDelete : null} headerText={campus.name} headerIcon="church" isSubmitting={isSubmitting}>
      <ErrorMessages errors={errors} />
      <TextField fullWidth label="Campus Name" id="name" name="name" type="text" value={campus.name} onChange={handleChange} />
    </InputBox>
  );
}
