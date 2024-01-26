<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 회원정보를 저장한다.
 *
 * @file /modules/member/processes/member.post.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 1. 26.
 *
 * @var \modules\member\Member $me
 */
if (defined('__IM_PROCESS__') == false) {
    exit();
}

/**
 * 관리자권한이 존재하는지 확인한다.
 */
if ($me->getAdmin()->checkPermission('members', ['edit']) == false) {
    $results->success = false;
    $results->message = $me->getErrorText('FORBIDDEN');
    return;
}

$member_id = Request::get('member_id');
if ($member_id !== null) {
}

$errors = [];
$email =
    Format::checkEmail(Input::get('email')) == true
        ? Input::get('email')
        : ($errors['email'] = $me->getErrorText('INVALID_EMAIL'));
if (isset($errors['email']) == false) {
    if ($me->hasActiveMember('email', $email, $member_id ?? 0) == true) {
        $errors['email'] = $me->getErrorText('DUPLICATED');
    }
}

$name = Input::get('name', $errors);
$nickname =
    Format::checkNickname(Input::get('nickname')) == true
        ? Input::get('nickname')
        : ($errors['nickname'] = $me->getErrorText('INVALID_NICKNAME'));
if (isset($errors['nickname']) == false) {
    if ($me->hasActiveMember('nickname', $email, $member_id ?? 0) == true) {
        $errors['nickname'] = $me->getErrorText('DUPLICATED');
    }
}

if ($member_id === null) {
    $password = Input::get('password', $errors);
}

if (count($errors) == 0) {
    $insert = [];
    if ($member_id === null) {
        $insert['email'] = $email;
        $insert['password'] = $password;
        $insert['name'] = $name;
        $insert['nickname'] = $nickname;
        $insert['verified'] = 'TRUE';
        $insert['status'] = 'ACTIVATED';
        $insert['joined_at'] = time();

        $member_id = $me->addMember($insert);
        if (is_int($member_id) == false) {
            $results->success = false;
            if (is_array($member_id) == true) {
                $results->errors = $member_id;
            }
            return;
        }
    }

    $results->success = true;
    $results->member_id = $member_id;
} else {
    $results->success = false;
    $results->errors = $errors;
}
