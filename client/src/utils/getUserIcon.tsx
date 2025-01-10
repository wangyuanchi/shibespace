const getUserIcon = (username: string): string => {
  return `https://api.dicebear.com/9.x/initials/svg?seed=${username}&backgroundType=gradientLinear`;
};

export default getUserIcon;
