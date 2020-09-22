# GoldPKG

![npm](https://img.shields.io/npm/v/goldpkg) ![C++](https://img.shields.io/badge/C++-Solutions-blue.svg?style=flat&logo=cplusplus) [![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/) [![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier) [![Lint and Format Status](https://github.com/pratikpc/GoldPKG/workflows/Lint-Format/badge.svg)](https://github.com/pratikpc/GoldPKG/actions)

---

_[Did you pay the Iron Price for CMake and VCPKg Integration or the Gold?](https://youtu.be/uY_KyLAdgfs?t=65)_

---

GoldPKG Helps our users pay the _Gold Price_ for [VCPKG](https://github.com/microsoft/vcpkg/) and CMake Integration by

1. Make VCPKG into the _[NPM](https://docs.npmjs.com/cli-documentation/) of the C++ World_ (at least npm install and uninstall :-P)
2. Making it _easier_ to integrate CMake and VCPKG Manifests
3. Making it _easier_ to install and remove packages from Manifests
4. Extend VCPKG with more tighter CMake Integration

## How To Install

---

You will need

1. [NodeJS/NPM](https://nodejs.org/)
2. [CMake](https://cmake.org/download/)
3. A Good C++ Compiler
4. [Ninja-Build](https://ninja-build.org/)(Not Required but we recommend)

```powershell
> npm install -g goldpkg
> goldpkg --init Project
```

This will create a CMake Project with GoldPKG Support

---

## Starting

---

Run `goldpkg --init Samples`  
This generates a CMake Project in the _Samples_ Folder  
The Code generated is Modular  
We provide a Sample Library in Lib Folder  
And Application in src
We also provide Unit Tests for Library

---

## How to use?

---

1. `goldpkg install pkg-names`  
   Overloads _`vcpkg install`_
   Installs the packages provided in Non-Manifest Mode  
   Adds packages to the manifest  
   Displays Find and Target to CMake for all packages in Manifest  
   If `--cmake` option is specified with path to CMake Directory, adds Find and Target to all CMakeLists.txt that match the glob

    Will add

    ```cmake
    # AUTOGEN FIND COMMANDS GENERATED BY goldpkg
    # AUTOGEN FIND PLEASE DO NOT MODIFY
    find_path(BOOST_ARRAY_INCLUDE_DIRS "boost/array.hpp")
    # AUTOGEN FIND LIBRARY WILL LOOK FOR PACKAGES HERE ONLY
    # AUTOGEN FIND ENDS HERE

    ...

    # AUTOGEN TARGET GENERATED BY goldpkg
    # AUTOGEN TARGET PLEASE DO NOT MODIFY
    target_include_directories(${PROJECT_NAME} PRIVATE ${BOOST_ARRAY_INCLUDE_DIRS})
    target_link_libraries(${PROJECT_NAME} PRIVATE libs::SAMPLE-LIB)
    # AUTOGEN TARGET LIBRARY WILL LOOK FOR PACKAGES HERE ONLY
    # AUTOGEN TARGET ENDS HERE
    ```

2. `goldpkg install`  
   Overloads `vcpkg install`  
   Displays Find and Target to CMake for all packages in Manifest

3. `goldpkg remove pkg-names`  
   Replaces `vcpkg remove` which does not work in Manifest mode  
   Removes pkg-names from Manifest  
   **DEFAULT**:- Removes the package from all `CMakeLists.txt` found  
   If `--cmake` option is specified, removes Packages from `CMakeLists` provided in command line

    This option here can be used as a glob also (provide src to remove from all CMakeLists.txt in src directory)

4. `goldpkg update`  
   Updates the vcpkg submodule  
   Runs bootstrap to rebuild `vcpkg` executable  
   Then runs vcpkg update

5. `goldpkg --versupgrade`

    Absent in VCPKG  
     One of our own commands.  
    Upgrades the _Semver_ version specified in the manifest (choices: _"`major`", "`premajor`", "`minor`", "`preminor`", "`patch`", "`prepatch`", "`prerelease`"_)

    We use the [same library as NPM](https://www.npmjs.com/package/semver)

6. Rest of the commands  
   Directly passed to `vcpkg`

---

## What next?

1. Initialize the Project
2. Install the Dependencies using (`goldpkg install`)
3. Modify the Code and add libraries to your liking
4. Run `cmake -S . -B build -G Ninja`  
   This will generate Ninja-Build files for you  
   I recommend using Ninja-Build because it's pretty nice
5. Run `cmake --build build` to build the code
6. `cd build`
7. Run `ctest` to start testing

---

## _OPTIONS_

---

| Option                    | Definition                                                                 | Type                                                                                      |
| :------------------------ | :------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------- |
| **--version**             | Show version number                                                        | `[boolean]`                                                                               |
| **--help**                | Show help                                                                  | `[boolean]`                                                                               |
| **--bootstrap**           | Bootstrap VCPKG                                                            | `[array]`                                                                                 |
| **--config-json**         | Provide Path to Configuration File. By Default, Looks in Current Directory | `[string]` [default: Current Directory]                                                   |
| _**--cmake**_             | Provide Path to `CMakeLists.txt`.                                          | `[string]`                                                                                |
| **--vcpkg-json**          | Provide Path to vcpkg Manifest                                             | `[string]` [default: Current Directory]                                                   |
| **--vcpkg-dir**           | Provide Path to VCPkg.                                                     | `[string]` [default: Current Directory]                                                   |
| **--save-dev**, **--dev** | Save New Package to Dev Environment                                        |                                                                                           |
| **--cmake-toolchain**     | Get the Path to VCPKG ToolChain File                                       |                                                                                           |
| **--triplet**             | Set the VCPKG Triplet                                                      | `[string]`                                                                                |
| **--versupgrade**         | Semver updates of Manifest                                                 | [`choices`: _"major", premajor", "minor", "preminor", "patch", "prepatch", "prerelease"_] |
| **--init**                | Name the Directory to Initialize the Project                               | `[string]`                                                                                |
| **--vcpkg**               | Pass Commands directly to VCPKG instead of using our Overloads             | `[array]`                                                                                 |

---

## ADDITIONAL CONFIGURATIONS

---

We provide a `.goldpkg.json` file by default

```yaml
{ 'Bootstrap': ['-disableMetrics'], 'VCPkg': [] }
```

Currently supports configuring Bootstrap and VCPKG with additional commands

---

## FAQ

---

1. Why do we need another package manager after the 100s we already have?
    <details>
     <summary>Spoiler Alert</summary>  
     We don't  
     Let's stop making new package managers and start supporting existing ones
     </details>

    Our package extends VCPKG to add support for CMake  
    VCPKG manages the packages  
    VCPKG performs the downloads  
    VCPKG performs the installations
    All we do is Integrate VCPKG and CMake

---

2. Do I need to add Toolchain File when running CMake?  
   No. We add the Toolchain to the Root CMake File we provide  
   No need to configure anything. The Process is Automatic  
   All you need to do is run at least one command in the Root directory

---

3. Do I need to install something for your Library to Work?  
   Yes you will need to [install Node.JS/NPM](https://nodejs.org/).  
   And then run the Command mentioned above

---

4. Does your App work on Windows & Linux?  
   You bet it does

---

5. Do you plan to add support for these to VCPKG?  
   That's the Aim.  
    See TypeScript allows us to develop the code very quickly  
    So this is a prototyping model  
    Based on the responses of the userbase, I will try to add new features

---

6. Do you work for Microsoft? Is this package officially backed by Microsoft or VCPKG Team?  
   The max I have done is created issues and used VCPKG since 2018  
   I do not and have not yet had the pleasure of working for them  
   So no, this package enjoys no official support from VCPKG or Microsoft

---

7. I have ideas to share and features to add. Can I help?  
   GoldPKG needs you!  
   It's sort of a meme I realise but there are a lot of features we can add here  
   And I cannot do it alone

---

8. I just learnt how to use VCPKG. Now I have to learn how to use this. Why?  
   This is a genuine question.  
   The thing is though, the way GoldPKG is designed, you do not have to learn
   a new anything.  
   GoldPKG overloads VCPKG commands  
   It uses absolutely the same commands so knowledge of one, transfers to another

---

9.  What do you provide in [the Generated Repo](https://github.com/pratikpc/GoldPKG-Template)?  
    We provide

    1. Clang-Format file. (To use Clang-Format with Support for globs as Input params install [clang-format-ex](https://www.npmjs.com/package/clang-format-ex). Another of my libraries)
    2. A Sample CMake Project with
        - Boost Array
        - Catch2 for Unit Testing
        - VCPKG Manifest with both installed
        - Why were these packages chosen?
            - To be honest, I have no idea why I chose Boost-Array
            - Catch2 is one of the most popular Unit Tests solutions though
    3. VCPKG installed as a Submodule
    4. An NPM Package.json
        - You can choose not to use it
        - I provided it because I sometimes use
            - [Husky](https://www.npmjs.com/package/husky)
            - [Lint-Staged](https://www.npmjs.com/package/lint-staged)
        - for [Git Hooks](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks)
    5. [GitHub Actions](https://docs.github.com/en/actions) for Unit Testing CMake on Windows, Linux and macOS

---

10. I want to run VCPKG Commands Directly. I don't want to use your overloads  
    We allow that  
    Use

```bash
> goldpkg --vcpkg <-commands->
```

---

## Samples Repo Location

Not to put to fine a point on it, [you could find it here](https://github.com/pratikpc/GoldPKG-Template)

We might need a lot of help optimising this repo to make it better for most of our userbase here as well

More comments and to make the CMake less CMake-y and more Tutorial like

(I have not written a lot of CMake code in my life and it shows)

---

## Reserved Sections in `CMakeLists.txt`

The idea is no..., we are not here to overrwrite your packages
We reserve our zones, you reserve yours

Now what if you have your own `find_package` commands?

No issues, we stop searching the moment our comment at the top is not found

We reserve our zones.

We do not focus on the rest

### 1. Zone For `find_`

Right below `project()` command

```cmake
project (SAMPLE-RUN)
# AUTOGEN FIND COMMANDS GENERATED BY goldpkg
```

---

### 2. Zone for `target_`

We add these at the very end  
At the last line

```cmake
target_link_libraries(${PROJECT_NAME} PRIVATE Catch2::Catch2)
# AUTOGEN TARGET LIBRARY WILL LOOK FOR PACKAGES HERE ONLY
# AUTOGEN TARGET ENDS HERE
```

---

### 3. Zone for `set (CMAKE_TOOLCHAIN_FILE`

We add this either to the first line or after `cmake_minimum_required`  
And only in the Top Level Directory (same as one with VCPKG Manifest)

```cmake
cmake_minimum_required(VERSION 3.14.0 FATAL_ERROR)

# AUTOGEN TOOLCHAIN Generated by goldpkg
# AUTOGEN TOOLCHAIN Links to LOCAL VCPKG ToolChain File
set(CMAKE_TOOLCHAIN_FILE ${CMAKE_CURRENT_SOURCE_DIR}/.vcpkg/scripts/buildsystems/vcpkg.cmake CACHE STRING "Vcpkg toolchain file")
# AUTOGEN TOOLCHAIN Generation ENDS
```

---

## HOW DOES IT ALL WORK

---

You work with the deficiencies of VCPKG  
VCPKG install in Manifest mode does not showcase CMake Information  
So we run `vcpkg install package-names` in Non-Manifest Mode first  
Get the package-names CMake Information  
And append those to the CMake Files

While removing, we do the same
Except we delete this time

---

## TODO

---

### 1. EASILY ACHIEVABLE

1. One of my favourite parts of NPM is that using NPM version <-option->

    - It not only updates the version like GoldPKG
    - But creates a Commit
    - And a Tag
    - We could add that

2. Nicer Template Repo
    - If you have seen our template, it must be
    - Painfully obvious that I am not Mr CMake
    - Painfully obvious I don't use CMake for a living
    - Painfully obvious the Unit Tests to everything are Zero Effort
    - If we could clean that up, it would be rather nice!

---

### 2. DIFFICULT TO ACHIEVE

1. Something similar to NPM PUBLISH
    - Automatically commit the code and create a Pull Request in VCPKG Repo Manually
    - This could be used via GitHub Actions or other such tools
    - Or, we modify GoldPKG
2. Something simplar to NPM Scripts
    - In NPM you can
    - Provide script command where
    - You can mention the commands you can run
    - Say something like
    - goldpkg run format
    - Would format your entire Codebase

---

## Contact the Developer

You can contact me via [LinkedIn](https://www.linkedin.com/in/pratik-chowdhury-889bb2183/) or create a GitHub Issue

---
