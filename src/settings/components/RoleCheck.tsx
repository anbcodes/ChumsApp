import React from "react";
import { ApiHelper, RolePermissionInterface } from "./";
import { FormGroup, FormControlLabel, Checkbox } from "@mui/material";

interface Props {
  apiName: string,
  contentType: string,
  action: string,
  label: string,
  roleId: string,
  rolePermissions: RolePermissionInterface[]
}

export const RoleCheck: React.FC<Props> = (props) => {
  const [rolePermission, setRolePermission] = React.useState<RolePermissionInterface>(null);

  const init = () => {
    for (let i = 0; i < props.rolePermissions.length; i++) {
      let rp = props.rolePermissions[i];
      if (rp.apiName === props.apiName && rp.contentType === props.contentType && rp.action === props.action) setRolePermission(rp);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      let rp: RolePermissionInterface = { roleId: props.roleId, apiName: props.apiName, contentType: props.contentType, action: props.action }
      ApiHelper.post("/rolepermissions/", [rp], "MembershipApi").then(data => {
        rp.id = data[0];
        setRolePermission(rp);
      });

    } else {
      ApiHelper.delete("/rolepermissions/" + rolePermission.id, "MembershipApi");
      setRolePermission(null);
    }
  }

  React.useEffect(init, [props.rolePermissions]); //eslint-disable-line

  return (
    <FormGroup>
      <FormControlLabel control={<Checkbox checked={rolePermission !== null} onChange={handleChange} />} label={props.label} />
    </FormGroup>
  );
}

