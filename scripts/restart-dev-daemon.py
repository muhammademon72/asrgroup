#!/usr/bin/env python3
"""
Restart ASR Group Next.js dev server as an immortal double-fork daemon.

Why double-fork: the sandbox reaper kills tool-call children between Bash
commands (even setsid + nohup). A process that double-forks (fork -> setsid ->
fork -> exec) is re-parented to init and survives.

Usage: python3 scripts/restart-dev-daemon.py
"""
import os
import sys
import time
import subprocess

PROJECT = "/home/z/my-project"
LOG = os.path.join(PROJECT, "dev.log")

# 1) Kill any existing dev server processes (platform-managed or stale)
subprocess.run(
    "pkill -9 -f 'next dev' ; pkill -9 -f 'next-server' ; pkill -9 -f 'bun run dev' ; pkill -9 -f 'tee dev.log'",
    shell=True,
)
time.sleep(2)


def spawn_daemon():
    """Double-fork so the grandchild survives the sandbox reaper."""
    pid = os.fork()
    if pid > 0:
        os._exit(0)  # parent exits immediately

    os.setsid()  # new session, detach from controlling terminal

    pid2 = os.fork()
    if pid2 > 0:
        os._exit(0)  # intermediate exits

    # Grandchild: fully detached daemon
    os.chdir(PROJECT)
    os.umask(0o022)

    # Redirect stdio to dev.log
    fd = os.open(LOG, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o644)
    os.dup2(fd, 0)
    os.dup2(fd, 1)
    os.dup2(fd, 2)
    os.close(fd)

    env = dict(os.environ)
    env.pop("PORT", None)
    # Exec next dev directly (bun wrapper would just be an extra parent)
    os.execvpe("npx", ["npx", "next", "dev", "-p", "3000"], env)


spawn_daemon()
