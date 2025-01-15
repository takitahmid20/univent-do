import React from 'react';
import { 
  Paper, 
  Typography, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Divider
} from '@mui/material';
import {
  TextFields as TextIcon,
  CheckBox as CheckboxIcon,
  RadioButtonChecked as RadioIcon,
  ArrowDropDown as SelectIcon,
  DateRange as DateIcon,
  AttachFile as FileIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Numbers as NumberIcon
} from '@mui/icons-material';

const fieldTypes = [
  { type: 'text', label: 'Text Input', icon: <TextIcon /> },
  { type: 'textarea', label: 'Text Area', icon: <TextIcon /> },
  { type: 'number', label: 'Number', icon: <NumberIcon /> },
  { type: 'email', label: 'Email', icon: <EmailIcon /> },
  { type: 'phone', label: 'Phone', icon: <PhoneIcon /> },
  { type: 'select', label: 'Dropdown', icon: <SelectIcon /> },
  { type: 'checkbox', label: 'Checkbox', icon: <CheckboxIcon /> },
  { type: 'radio', label: 'Radio Group', icon: <RadioIcon /> },
  { type: 'date', label: 'Date Picker', icon: <DateIcon /> },
  { type: 'file', label: 'File Upload', icon: <FileIcon /> }
];

const FormFieldToolbox = ({ onAddField }) => {
  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Form Fields
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Drag or click to add fields
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <List>
        {fieldTypes.map((field) => (
          <ListItem
            key={field.type}
            button
            onClick={() => onAddField(field.type)}
            sx={{
              mb: 1,
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              '&:hover': {
                backgroundColor: 'action.hover',
                transform: 'translateX(5px)',
                transition: 'all 0.2s'
              }
            }}
          >
            <ListItemIcon>{field.icon}</ListItemIcon>
            <ListItemText primary={field.label} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default FormFieldToolbox;
