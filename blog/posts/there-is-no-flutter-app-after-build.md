![Compilation Overview](/assets/images/blog/flutter-build/compilation-overview.png)

---

## A Simple Question with a Complex Answer

A product planning colleague asked about the tech stack. The response needed to be accurate yet accessible: "The current app is developed with Flutter, and then we deploy it natively for both iOS and Android." This created confusion about why separate deployment occurred if Flutter's purpose is unified development.

The simpler answer given was: "We're developing with Flutter." However, this gap between engineering and product teams creates recurring friction when designing platform-specific features like phone calls, in-app purchases, App Tracking Transparency, or permission requests.

**The core insight: "There is no Flutter app after build!"**


## The Basics: From Source Code to Executable

A compiler translates human-readable source code into machine code that processors can execute. The journey involves:

1. **Source Code** — Developer writes a file (e.g., `.c`)
2. **Compilation** — Compiler translates to assembly code
3. **Assembly** — Assembler converts to object files (`.o`)
4. **Linking** — Linker combines object files with libraries to produce executable binary

This final file is the app — self-contained machine code the CPU executes directly.
## Two Paths, One Destination: Swift vs. Dart Compilation

Both modern frameworks reach the same end product: a binary file of machine code, using different paths.

### Apple's Path: How a Swift App is Born

The Swift compilation process leverages LLVM:

1. The Swift Compiler parses code into an Abstract Syntax Tree (AST), then converts to Swift Intermediate Language (SIL) for Swift-specific optimization
2. The compiler lowers optimized SIL into LLVM IR, enabling language-agnostic optimization
3. LLVM Back-End generates machine-specific ARM64 assembly
4. LLVM assembler translates assembly into object files
5. System linker (`ld`) combines object files with system frameworks to produce the final binary executable

### Google's Path: How a "Flutter App" Becomes an iOS App

Flutter's release-mode process produces a fully native binary:

1. CFE (Common Front-End) parses Dart source code into Kernel IR — a platform-agnostic Abstract Syntax Tree stored in `.dill` files
2. TFA (Type Flow Analysis) performs whole-program analysis for optimization, including tree shaking
3. Dart AOT Compiler generates low-level IR, then ARM64 assembly, with internal assembler producing object files
4. System linker (`ld`) combines object files with necessary frameworks (UIKit for Swift, Flutter Engine for Dart containing Skia, Dart runtime) to create the final executable

### The Big Reveal: It's All Just an iOS App

Both Swift and Dart paths end identically: a call to Apple's native linker (`ld`) producing a standard iOS binary with ARM64 machine code.

> "The final product is fundamentally the same. Your iPhone's processor doesn't know or care if the original source code was Dart or Swift. It just sees a set of native instructions to execute."

**Key point:** There is no special "Flutter virtual machine" or "interpreter" in the final release build — only an iOS app.

## Extra: JIT Compilation

Dart supports Just-In-Time (JIT) compilation, powering Flutter's Stateful Hot Reload, which differs from AOT's pre-execution compilation.

### Phase 1: Happens Once

Source code converts to Kernel IR (optionally through TFA for light optimization), then to Unoptimized IL, which the Interpreter executes immediately. **Phase 1 prioritizes fast startup.**

### Phase 2: Repeats Continuously While App Runs

The Profiler tracks function execution counts. When thresholds are exceeded, the JIT Compiler translates flagged "hot" functions through Optimized IL to binary machine code, which the Dart VM then swaps in place of interpreted code. **Phase 2 provides continuous optimization.**

### Apple's Unique Challenge: Security Constraints

Apple's App Store Review Guidelines prohibit apps from dynamically generating executable code at runtime. This creates different debug modes:

- **Debugging on Physical iPhone:** Flutter disables Phase 2, running in Interpreter-Only mode using Phase 1 only. This enables code reloading and Stateful Hot Reload without violating the "no JIT" rule.
- **Debugging on iOS Simulator:** The full two-phase process runs since simulators (Mac apps) aren't subject to on-device restrictions.

Now we can understand this summary table.

![Debug Modes Comparison](/assets/images/blog/flutter-build/debug-modes.png)

## Beyond Flutter

When asked about tech stack, "Flutter" is often sufficient in casual conversation. However, once built, "there is no such thing as a single, universal 'Flutter app.' What we actually ship are an iOS app and an Android app, each bound by its platform's rules."

Example constraint: Phone call handling differs by platform. Android apps can navigate directly to calling screens; iOS forces a system confirmation sheet with no bypass option. If someone assumes "it's Flutter, so behavior will be identical," they'll quickly run into platform restrictions that no amount of shared code can override.

**Flutter unifies development, but the platforms define reality.**
