export {};

// Declare module types for asset files
declare module '*.glb' {
  const content: string;
  export default content;
}

declare module '*.gltf' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

// react-three/* and meshline were removed together with Lanyard.jsx. If a 3D
// block comes back, re-add its module declarations (and the meshLineGeometry /
// meshLineMaterial JSX intrinsics for meshline) here.