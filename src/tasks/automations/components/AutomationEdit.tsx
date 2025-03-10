import { FormControl, Grid, InputLabel, MenuItem, Select, SelectChangeEvent, TextField } from "@mui/material";
import React from "react";
import { ErrorMessages, InputBox, AutomationInterface, ApiHelper } from "../../components";

interface Props {
  automation: AutomationInterface,
  onCancel: () => void,
  onSave: (automation: AutomationInterface) => void,
}

export const AutomationEdit = (props: Props) => {
  const [automation, setAutomation] = React.useState<AutomationInterface>(null);
  const [errors, setErrors] = React.useState([]);

  const init = () => {
    setAutomation(props.automation);
  }

  React.useEffect(init, [props.automation]);

  const validate = () => {
    const result: string[] = [];
    setErrors(result);
    return result.length === 0;
  }

  const handleSave = async () => {
    if (validate()) {
      ApiHelper.post("/automations", [automation], "DoingApi").then(d => {
        props.onSave(d[0]);
      });
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>) => {
    const val = e.target.value;
    const a = { ...automation };
    switch (e.target.name) {
      case "title":
        a.title = val;
        break;
      case "recurs":
        a.recurs = val;
        break;
    }
    setAutomation(a);
  }

  return (
    <InputBox headerIcon="settings_suggest" headerText="Edit Automation" saveFunction={handleSave} cancelFunction={props.onCancel}>
      <ErrorMessages errors={errors} />
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField fullWidth label="Title" value={automation?.title || ""} name="title" onChange={handleChange} />
          <FormControl fullWidth>
            <InputLabel>Repeat</InputLabel>
            <Select fullWidth label="Repeat" value={automation?.recurs || ""} name="recurs" onChange={handleChange}>
              <MenuItem value="never">Never</MenuItem>
              <MenuItem value="yearly">Yearly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
            </Select>
          </FormControl>

        </Grid>
      </Grid>
    </InputBox>
  );
}
