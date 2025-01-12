import unknown from "../assets/unknown.png";

const getUserIcon = (username: string): string => {
  return username === ""
    ? unknown
    : `https://api.dicebear.com/9.x/initials/svg?seed=${username}&backgroundType=gradientLinear`;
};

export default getUserIcon;
