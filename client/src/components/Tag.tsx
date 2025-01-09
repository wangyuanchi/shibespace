import Chip from "@mui/material/Chip";

interface Props {
  value: string;
}

const Tag: React.FC<Props> = ({ value }) => {
  return <Chip label={value} size="small" />;
};

export default Tag;
