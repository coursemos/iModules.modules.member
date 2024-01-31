<?php
/**
 * 이 파일은 아이모듈 회원모듈의 일부입니다. (https://www.imodules.io)
 *
 * 레벨정보를 저장한다.
 *
 * @file /modules/member/processes/level.post.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 1. 29.
 *
 * @var \modules\member\Member $me
 */
if (defined('__IM_PROCESS__') == false) {
    exit();
}

/**
 * 관리자권한이 존재하는지 확인한다.
 */
if ($me->getAdmin()->checkPermission('members', ['levels']) == false) {
    $results->success = false;
    $results->message = $me->getErrorText('FORBIDDEN');
    return;
}

$level_id = Request::get('level_id');
if ($level_id !== null) {
    $level = $me
        ->db()
        ->select()
        ->from($me->table('levels'))
        ->where('level_id', $level_id)
        ->getOne();

    if ($level === null) {
        $results->success = false;
        $results->message = $me->getErrorText('NOT_FOUND_DATA');
        return;
    }
} else {
    $level = null;
}

$errors = [];
$level_id = Input::get('level_id', $errors);
$title = Input::get('title', $errors);

if ($level_id !== null) {
    $checked = $me
        ->db()
        ->select()
        ->from($me->table('levels'))
        ->where('level_id', $level_id);
    if ($level !== null) {
        $checked->where('level_id', $level->level_id, '!=');
    }
    if ($checked->has() == true) {
        $errors['level_id'] = $me->getErrorText('DUPLICATED');
    }
}

if ($title !== null) {
    $checked = $me
        ->db()
        ->select()
        ->from($me->table('levels'))
        ->where('title', $title);
    if ($level !== null) {
        $checked->where('level_id', $level->level_id, '!=');
    }
    if ($checked->has() == true) {
        $errors['title'] = $me->getErrorText('DUPLICATED');
    }
}

if ($level?->level_id === 0 && intval($level_id, 10) !== 0) {
    $results->success = false;
    $results->message = $me->getErrorText('DEFAULT_LEVEL_EDIT_FAILED');
    return;
}

if (count($errors) == 0) {
    if ($level === null) {
        $me->db()
            ->insert($me->table('levels'), ['level_id' => $level_id, 'title' => $title])
            ->execute();
    } else {
        if ($level->level_id != $level_id) {
            $me->db()
                ->update($me->table('members'), ['level_id' => $level_id])
                ->wherE('level_id', $level->level_id)
                ->execute();
        }

        $me->db()
            ->update($me->table('levels'), ['level_id' => $level_id, 'title' => $title])
            ->where('level_id', $level->level_id)
            ->execute();
    }

    $me->getLevel($level_id)->update();

    $results->success = true;
    $results->level_id = $level_id;
} else {
    $results->success = false;
    $results->errors = $errors;
}
