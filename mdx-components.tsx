import type { MDXComponents } from "mdx/types";

const components: MDXComponents = {
  button: (props) => <button {...props} />,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
