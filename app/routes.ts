import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route('/auth', 'routes/auth.tsx'),
    route('/resumind', 'routes/resumind/home.tsx'),
    route('/resumind/agent', 'routes/resumind/agent.tsx'),
    route('/resumind/resume/:id', 'routes/resumind/resume.tsx'),
] satisfies RouteConfig;
