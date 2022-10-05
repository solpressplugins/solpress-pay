import { __ } from "@wordpress/i18n";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";
import { AlertI } from "../../types/Alert";
import useAlert from "../../hooks/useAlert";

function PageAlert({ type, content, id }: AlertI) {
  const [open, setOpen] = useState(true);
  const { removeAlert } = useAlert();

  function remove() {
    if (!open) {
      removeAlert(id);
    }
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Collapse in={open}>
        <Alert
          id={`alert-${id}`}
          severity={type}
          action={
            <IconButton
              aria-label={__("close")}
              color="inherit"
              size="small"
              onClick={() => {
                setOpen(false);
              }}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          onTransitionEnd={remove}
          sx={{ mb: 2 }}
        >
          {__(content)}
        </Alert>
      </Collapse>
    </Box>
  );
}

export default PageAlert;
