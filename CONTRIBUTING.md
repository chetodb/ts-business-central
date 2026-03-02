# CONTRIBUTING.md

[English](#english) | [Español](#español)

---

<a name="english"></a>

## English 🇬🇧

### Welcome to `ts-business-central` 🚀

Thank you for your interest in contributing! We love community input. This document will guide you through the process of setting up the project locally and submitting your changes.

#### 🏗 Development Setup

1. **Fork the Repository**: Create a fork in your GitHub account.
2. **Clone your Fork**:

   ```bash
   git clone https://github.com/YOUR_USERNAME/ts-business-central.git
   cd ts-business-central
   ```

3. **Install Dependencies**: This project uses `pnpm` workspaces.

   ```bash
   pnpm install
   ```

4. **Environment**: Ensure you have a `.env` file in the root if you plan to run integration tests (see `.env.example`).

#### � Architecture Rules

- The `core` package must remain framework-agnostic. It cannot depend on NestJS or other frameworks.
- Use `workspace:*` for deep dependencies between mono-repo packages.

#### 🛠 Monorepo Workflow

Since this is a monorepo, we use specialized commands to work with different packages:

- **Build all**: `pnpm build`
- **Build Core only**: `pnpm --filter @chetodb/business-central build`
- **Run Tests**: `pnpm test` (Uses Vitest)
- **Lint & Format**: `pnpm lint` (Uses Biome)

#### 🧪 Testing Guidelines

- We use **Vitest** as our testing framework.
- All new features must include unit tests.
- Run tests (`pnpm test`) before submitting a PR to ensure no regressions.
- Use the `playground` folder to manually test new SDK behaviors.

#### 📮 Pull Request Process

1. Create a new branch: `git checkout -b feature/my-new-feature`.
2. Commit your changes. You **must** follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) formats (e.g., `feat:`, `fix:`, `docs:`) as it guarantees automatic bump versioning on the CI/CD platform.
3. Push to your fork: `git push origin feature/my-new-feature`.
4. Open a Pull Request against the `main` branch.
5. Ensure the CI pipeline passes.

---

<a name="español"></a>

## Español 🇪🇸

### ¡Bienvenido a `ts-business-central`! 🚀

Gracias por tu interés en contribuir. Nos encanta recibir aportaciones de la comunidad. Este documento te guiará en el proceso de configuración del proyecto en local y el envío de tus cambios.

#### 🏗 Configuración del Desarrollo

1. **Hacer un Fork**: Crea un fork en tu cuenta de GitHub.
2. **Clonar tu Fork**:

   ```bash
   git clone https://github.com/TU_USUARIO/ts-business-central.git
   cd ts-business-central
   ```

3. **Instalar Dependencias**: Este proyecto utiliza `pnpm` workspaces.

   ```bash
   pnpm install
   ```

4. **Entorno**: Asegúrate de tener un archivo `.env` en la raíz si planeas ejecutar tests de integración (consulta `.env.example`).

#### � Reglas de Arquitectura

- El paquete `core` debe ser agnóstico. No puede depender de NestJS ni de ningún otro framework.
- Utilice `workspace:*` para vincular dependencias locales entre paquetes en el monorepo.

#### 🛠 Workflow del Monorepo

Al ser un monorepo, utilizamos comandos especializados para trabajar con diferentes paquetes:

- **Construir todo**: `pnpm build`
- **Construir solo el Core**: `pnpm --filter @chetodb/business-central build`
- **Ejecutar Tests**: `pnpm test` (Utiliza Vitest)
- **Lint & Format**: `pnpm lint` (Utiliza Biome)

#### 🧪 Guías de Testing

- Utilizamos **Vitest** como nuestro framework de pruebas.
- Todas las nuevas funcionalidades deben incluir tests unitarios.
- Ejecuta los tests (`pnpm test`) antes de enviar una PR para asegurar que no hay regresiones.
- Usa la carpeta `playground` para probar manualmente nuevos comportamientos del SDK.

#### 📮 Proceso de Pull Request

1. Crea una nueva rama: `git checkout -b feature/mi-nueva-funcionalidad`.
2. Haz commit de tus cambios. **Debes** seguir el formato de [Conventional Commits](https://www.conventionalcommits.org/es/v1.0.0/) (ej. `feat:`, `fix:`, `docs:`) ya que se utiliza para lanzar nuevas versiones desde la plataforma de CI/CD.
3. Sube los cambios a tu fork: `git push origin feature/mi-nueva-funcionalidad`.
4. Abre una Pull Request contra la rama `main`.
5. Asegúrate de que los tests de la CI pasen correctamente.

---

### Need Help? / ¿Necesitas ayuda? 🆘

If you have questions, feel free to open an issue or join the discussion. / Si tienes dudas, siéntete libre de abrir un issue o unirte a la discusión.

Thank you for contributing! / ¡Gracias por contribuir! 🙌
