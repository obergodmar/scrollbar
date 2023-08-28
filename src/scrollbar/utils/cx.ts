type Arg = string | false | undefined;

export const cx = (...args: Arg[]): string => {
  return args.filter(Boolean).join(' ');
};
