import {
  addDependenciesToPackageJson,
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  Tree,
  updateJson,
} from '@nx/devkit';
import * as path from 'path';
import { ShaderGeneratorSchema } from './schema';

export async function shaderGenerator(
  tree: Tree,
  options: ShaderGeneratorSchema
) {
  const projectRoot = `${options.directory ?? ""}`;
  addProjectConfiguration(tree, options.name, {
    root: projectRoot,
    projectType: 'library',
    sourceRoot: `${projectRoot}/src`,
    targets: {},
  });
  generateFiles(tree, path.join(__dirname, 'files'), projectRoot, options);

  const importPath = options.importPath || `${projectRoot}/${options.name}`;

  await updateJson(tree, 'tsconfig.base.json', (json) => {
    const projectPath = `${projectRoot}/index.ts`;
    json.compilerOptions.paths = {
      ...json.compilerOptions.paths,
      [importPath]: [projectPath],
    };
    return json;
  });

  await formatFiles(tree);
  const installTask = await addDependenciesToPackageJson(
    tree,
    {},
    { 'raw-loader': '^4.0.2' }
  );

  return installTask;
}

export default shaderGenerator;
