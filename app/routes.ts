import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route('/auth', 'routes/auth.tsx'),
    route('/upload', 'routes/upload.tsx'),
    route('/resumind', 'routes/resumind/agent.tsx'),
    route('/resumind/resume', 'routes/resumind/resume.tsx'),
] satisfies RouteConfig;
